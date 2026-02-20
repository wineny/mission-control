import { NextResponse } from "next/server";
import { readdir, readFile, stat } from "fs/promises";
import { join } from "path";

const WORKSPACE = join(process.env.HOME || "", ".openclaw/workspace");

interface MemoryFile {
  name: string;
  path: string;
  content: string;
  modifiedAt: string;
  type: "daily" | "longterm" | "workspace";
}

export async function GET() {
  try {
    const files: MemoryFile[] = [];

    // Read MEMORY.md (long-term)
    try {
      const memPath = join(WORKSPACE, "MEMORY.md");
      const content = await readFile(memPath, "utf-8");
      const info = await stat(memPath);
      files.push({
        name: "MEMORY.md",
        path: memPath,
        content,
        modifiedAt: info.mtime.toISOString(),
        type: "longterm",
      });
    } catch {
      // no MEMORY.md
    }

    // Read daily memory files
    const memoryDir = join(WORKSPACE, "memory");
    try {
      const dailyFiles = await readdir(memoryDir);
      const mdFiles = dailyFiles
        .filter((f) => f.endsWith(".md"))
        .sort()
        .reverse()
        .slice(0, 10);

      for (const f of mdFiles) {
        const fPath = join(memoryDir, f);
        const content = await readFile(fPath, "utf-8");
        const info = await stat(fPath);
        files.push({
          name: f,
          path: fPath,
          content,
          modifiedAt: info.mtime.toISOString(),
          type: "daily",
        });
      }
    } catch {
      // no memory dir
    }

    // Read key workspace files
    const workspaceFiles = [
      "SOUL.md",
      "USER.md",
      "HEARTBEAT.md",
      "AGENTS.md",
      "TOOLS.md",
    ];
    for (const wf of workspaceFiles) {
      try {
        const wPath = join(WORKSPACE, wf);
        const content = await readFile(wPath, "utf-8");
        const info = await stat(wPath);
        files.push({
          name: wf,
          path: wPath,
          content,
          modifiedAt: info.mtime.toISOString(),
          type: "workspace",
        });
      } catch {
        // file doesn't exist
      }
    }

    return NextResponse.json({ files });
  } catch {
    return NextResponse.json({ files: [] }, { status: 500 });
  }
}
