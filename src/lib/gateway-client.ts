import WebSocket from "ws";
import { randomUUID } from "crypto";

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || "ws://127.0.0.1:18789";
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || "";
const RPC_TIMEOUT = 30_000;

let ws: WebSocket | null = null;
let authenticated = false;
let connectPromise: Promise<void> | null = null;
const pending = new Map<string, PendingRequest>();

function debug(msg: string, ...args: unknown[]) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[gateway] ${msg}`, ...args);
  }
}

function cleanup() {
  authenticated = false;
  connectPromise = null;
  for (const [id, req] of pending) {
    req.reject(new Error("Connection closed"));
    clearTimeout(req.timer);
    pending.delete(id);
  }
  if (ws) {
    ws.removeAllListeners();
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
    ws = null;
  }
}

function connect(): Promise<void> {
  if (authenticated && ws && ws.readyState === WebSocket.OPEN) {
    return Promise.resolve();
  }
  if (connectPromise) return connectPromise;

  connectPromise = new Promise<void>((resolve, reject) => {
    cleanup();
    debug("connecting to", GATEWAY_URL);

    const socket = new WebSocket(GATEWAY_URL);
    ws = socket;
    let connectSent = false;

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Connection timeout"));
    }, 15_000);

    socket.on("open", () => {
      debug("ws open, waiting for challenge...");
    });

    socket.on("message", (data: WebSocket.Data) => {
      const raw = data.toString();
      debug("recv:", raw.slice(0, 300));
      let frame: Record<string, unknown>;
      try {
        frame = JSON.parse(raw);
      } catch {
        return;
      }

      // Handle event frames (challenge)
      if (frame.type === "event") {
        const event = frame.event as string;
        if (event === "connect.challenge" && !connectSent) {
          connectSent = true;
          debug("got challenge, sending connect...");
          const connectId = randomUUID();
          const connectFrame = {
            type: "req",
            id: connectId,
            method: "connect",
            params: {
              minProtocol: 3,
              maxProtocol: 3,
              client: {
                id: "gateway-client",
                version: "1.0.0",
                platform: "node",
                mode: "backend",
              },
              role: "operator",
              scopes: ["operator.admin"],
              auth: { token: GATEWAY_TOKEN },
              caps: [],
            },
          };
          const connectTimer = setTimeout(() => {
            pending.delete(connectId);
            clearTimeout(timeout);
            cleanup();
            reject(new Error("Connect auth timeout"));
          }, 10_000);
          pending.set(connectId, {
            resolve: () => {
              clearTimeout(timeout);
              authenticated = true;
              debug("authenticated!");
              resolve();
            },
            reject: (err: Error) => {
              clearTimeout(timeout);
              cleanup();
              reject(err);
            },
            timer: connectTimer,
          });
          socket.send(JSON.stringify(connectFrame));
        }
        return;
      }

      // Handle response frames
      if (frame.type === "res") {
        const id = frame.id as string;
        const ok = frame.ok as boolean;
        const p = pending.get(id);
        if (!p) return;
        pending.delete(id);
        clearTimeout(p.timer);
        if (ok) {
          p.resolve(frame.payload);
        } else {
          const error = frame.error as { message?: string } | undefined;
          p.reject(new Error(error?.message || "Request failed"));
        }
      }
    });

    socket.on("error", (err) => {
      debug("ws error:", err.message);
      clearTimeout(timeout);
      cleanup();
      reject(err);
    });

    socket.on("close", () => {
      debug("ws closed");
      cleanup();
    });
  });

  return connectPromise;
}

export async function rpc<T = unknown>(method: string, params?: Record<string, unknown>): Promise<T> {
  await connect();
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    throw new Error("Not connected");
  }

  const id = randomUUID();
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`RPC timeout: ${method}`));
    }, RPC_TIMEOUT);

    pending.set(id, {
      resolve: resolve as (v: unknown) => void,
      reject,
      timer,
    });

    const frame = { type: "req", id, method, params: params || {} };
    ws!.send(JSON.stringify(frame));
    debug("sent:", method, params);
  });
}

export async function isConnected(): Promise<boolean> {
  try {
    await connect();
    return authenticated && ws !== null && ws.readyState === WebSocket.OPEN;
  } catch {
    return false;
  }
}

export function disconnect() {
  cleanup();
}
