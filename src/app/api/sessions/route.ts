import { NextResponse } from "next/server";
import { readdir, readFile } from "fs/promises";
import { join } from "path";

const SESSIONS_DIR = join(
  process.env.HOME || "",
  ".openclaw/agents/main/sessions"
);

interface SessionEntry {
  id: string;
  timestamp: string;
  topic: string;
  messageCount: number;
  firstMessage: string;
}

export async function GET() {
  try {
    const files = await readdir(SESSIONS_DIR);
    const jsonlFiles = files
      .filter((f) => f.endsWith(".jsonl"))
      .sort()
      .reverse()
      .slice(0, 20);

    const sessions: SessionEntry[] = [];

    for (const file of jsonlFiles) {
      const content = await readFile(join(SESSIONS_DIR, file), "utf-8");
      const lines = content.split("\n").filter(Boolean);

      let id = "";
      let timestamp = "";
      let firstUserMsg = "";
      let messageCount = 0;

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.type === "session") {
            id = parsed.id;
            timestamp = parsed.timestamp;
          }
          if (parsed.type === "message") {
            messageCount++;
            if (!firstUserMsg && parsed.message?.role === "user") {
              const text =
                typeof parsed.message.content === "string"
                  ? parsed.message.content
                  : parsed.message.content?.[0]?.text || "";
              firstUserMsg = text.slice(0, 200);
            }
          }
        } catch {
          // skip malformed lines
        }
      }

      if (id) {
        sessions.push({
          id,
          timestamp,
          topic: firstUserMsg || "(대화 내용 없음)",
          messageCount,
          firstMessage: firstUserMsg,
        });
      }
    }

    return NextResponse.json({ sessions });
  } catch {
    return NextResponse.json({ sessions: [] }, { status: 500 });
  }
}
