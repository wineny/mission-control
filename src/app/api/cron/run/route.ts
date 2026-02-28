import { NextResponse } from "next/server";
import { rpc } from "@/lib/gateway-client";

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    const result = await rpc("cron.run", { id, mode: "force" });
    return NextResponse.json({ result });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
