import { NextResponse } from "next/server";
import { rpc } from "@/lib/gateway-client";
import type { CronRunEntry } from "@/lib/gateway-types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);
    const runs = await rpc<CronRunEntry[]>("cron.runs", { id, limit });
    return NextResponse.json({ runs: runs || [] });
  } catch (err) {
    return NextResponse.json(
      { runs: [], error: (err as Error).message },
      { status: 500 }
    );
  }
}
