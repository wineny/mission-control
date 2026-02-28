import { NextResponse } from "next/server";
import { rpc } from "@/lib/gateway-client";
import type { AgentInfo } from "@/lib/gateway-types";

export async function GET() {
  try {
    const agents = await rpc<AgentInfo[]>("agents.list");
    const enriched = await Promise.all(
      (agents || []).map(async (agent) => {
        try {
          const identity = await rpc<Record<string, unknown>>("agent.identity.get", { agentId: agent.id });
          return { ...agent, ...identity };
        } catch {
          return agent;
        }
      })
    );
    return NextResponse.json({ agents: enriched });
  } catch (err) {
    return NextResponse.json(
      { agents: [], error: (err as Error).message },
      { status: 500 }
    );
  }
}
