import { NextResponse } from "next/server";
import { rpc } from "@/lib/gateway-client";
import type { SessionEntry } from "@/lib/gateway-types";

interface GatewaySession {
  key: string;
  sessionId: string;
  displayName?: string;
  label?: string;
  updatedAt?: number;
  totalTokens?: number;
  inputTokens?: number;
  outputTokens?: number;
  kind?: string;
}

interface GatewaySessionsResponse {
  sessions: GatewaySession[];
  count: number;
  ts: number;
}

function mapGatewaySessions(raw: GatewaySessionsResponse): SessionEntry[] {
  const list = Array.isArray(raw?.sessions) ? raw.sessions : [];
  return list.slice(0, 20).map((s) => ({
    id: s.sessionId || s.key,
    startedAt: s.updatedAt ? new Date(s.updatedAt).toISOString() : undefined,
    topic: s.displayName || s.label || s.key || "(이름 없음)",
    messageCount: s.totalTokens ? Math.round(s.totalTokens / 500) : 0,
    status: "completed",
  }));
}

export async function GET() {
  try {
    const raw = await rpc<GatewaySessionsResponse>("sessions.list");
    const sessions = mapGatewaySessions(raw);
    return NextResponse.json({ sessions });
  } catch {
    // Fallback to filesystem if gateway fails
    try {
      const { readdir, readFile } = await import("fs/promises");
      const { join } = await import("path");
      const SESSIONS_DIR = join(process.env.HOME || "", ".openclaw/agents/main/sessions");
      const files = await readdir(SESSIONS_DIR);
      const jsonlFiles = files.filter(f => f.endsWith(".jsonl")).sort().reverse().slice(0, 20);

      const sessions: SessionEntry[] = [];
      for (const file of jsonlFiles) {
        const content = await readFile(join(SESSIONS_DIR, file), "utf-8");
        const lines = content.split("\n").filter(Boolean);
        let id = "", timestamp = "", firstMsg = "", msgCount = 0;

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.type === "session") { id = parsed.id; timestamp = parsed.timestamp; }
            if (parsed.type === "message") {
              msgCount++;
              if (!firstMsg && parsed.message?.role === "user") {
                const text = typeof parsed.message.content === "string"
                  ? parsed.message.content : parsed.message.content?.[0]?.text || "";
                firstMsg = text.slice(0, 200);
              }
            }
          } catch { /* skip */ }
        }

        if (id) {
          sessions.push({
            id,
            startedAt: timestamp,
            topic: firstMsg || "(대화 내용 없음)",
            messageCount: msgCount,
          });
        }
      }
      return NextResponse.json({ sessions });
    } catch {
      return NextResponse.json({ sessions: [] }, { status: 500 });
    }
  }
}
