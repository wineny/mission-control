import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

const WORKSPACE = join(process.env.HOME || "", ".openclaw/workspace");

export async function GET() {
  try {
    const soul = await readFile(join(WORKSPACE, "SOUL.md"), "utf-8");

    // Extract mission statement block
    const missionMatch = soul.match(
      new RegExp("## Mission Statement\\n\\n> \\*\\*(.*?)\\*\\*", "s")
    );
    const mission = missionMatch?.[1] || "미션 스테이트먼트가 설정되지 않았습니다.";

    return NextResponse.json({ mission });
  } catch {
    return NextResponse.json(
      { mission: "SOUL.md를 읽을 수 없습니다." },
      { status: 500 }
    );
  }
}
