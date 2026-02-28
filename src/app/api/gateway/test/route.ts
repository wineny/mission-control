import { NextResponse } from "next/server";
import { rpc, isConnected } from "@/lib/gateway-client";

export async function GET() {
  try {
    const connected = await isConnected();
    const jobs = await rpc("cron.list");
    return NextResponse.json({ connected, jobs });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message, connected: false },
      { status: 500 }
    );
  }
}
