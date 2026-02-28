import { NextResponse } from "next/server";
import { rpc } from "@/lib/gateway-client";
import type { CronListResponse } from "@/lib/gateway-types";

export async function GET() {
  try {
    const data = await rpc<CronListResponse>("cron.list");
    return NextResponse.json({ jobs: data?.jobs || [] });
  } catch (err) {
    return NextResponse.json(
      { jobs: [], error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await rpc("cron.add", body);
    return NextResponse.json({ result });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
