import { NextResponse } from "next/server";
import { readdir, readFile, stat, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { createHash } from "crypto";

const WORKSPACE = join(process.env.HOME || "", ".openclaw/workspace");
const SNAPSHOT_DIR = join(
  process.env.HOME || "",
  ".openclaw/workspace/.memory-snapshots"
);

interface DiffLine {
  type: "added" | "removed" | "unchanged";
  text: string;
}

interface TimelineEntry {
  name: string;
  type: "daily" | "longterm" | "workspace";
  modifiedAt: string;
  sizeBytes: number;
  lineCount: number;
  hash: string;
  content: string;
  staleDays: number;
  diff: DiffLine[] | null;
  prevSnapshotAt: string | null;
}

function md5(content: string): string {
  return createHash("md5").update(content).digest("hex").slice(0, 12);
}

function daysBetween(date: Date, now: Date): number {
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

function computeDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const oldSet = new Set(oldLines);
  const newSet = new Set(newLines);
  const result: DiffLine[] = [];

  // Simple line-level diff: walk through new lines
  let oi = 0;
  let ni = 0;

  while (oi < oldLines.length || ni < newLines.length) {
    if (oi < oldLines.length && ni < newLines.length) {
      if (oldLines[oi] === newLines[ni]) {
        result.push({ type: "unchanged", text: newLines[ni] });
        oi++;
        ni++;
      } else if (!newSet.has(oldLines[oi])) {
        result.push({ type: "removed", text: oldLines[oi] });
        oi++;
      } else if (!oldSet.has(newLines[ni])) {
        result.push({ type: "added", text: newLines[ni] });
        ni++;
      } else {
        // Both exist somewhere else, treat as remove + add
        result.push({ type: "removed", text: oldLines[oi] });
        oi++;
      }
    } else if (oi < oldLines.length) {
      result.push({ type: "removed", text: oldLines[oi] });
      oi++;
    } else {
      result.push({ type: "added", text: newLines[ni] });
      ni++;
    }
  }

  return result;
}

interface Snapshot {
  hash: string;
  content: string;
  savedAt: string;
}

async function loadSnapshot(name: string): Promise<Snapshot | null> {
  try {
    const data = await readFile(
      join(SNAPSHOT_DIR, `${name}.json`),
      "utf-8"
    );
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function saveSnapshot(
  name: string,
  hash: string,
  content: string
): Promise<void> {
  try {
    await mkdir(SNAPSHOT_DIR, { recursive: true });
    const snapshot: Snapshot = {
      hash,
      content,
      savedAt: new Date().toISOString(),
    };
    await writeFile(
      join(SNAPSHOT_DIR, `${name}.json`),
      JSON.stringify(snapshot)
    );
  } catch {
    // ignore write errors
  }
}

async function readEntry(
  filePath: string,
  name: string,
  type: TimelineEntry["type"],
  now: Date
): Promise<TimelineEntry | null> {
  try {
    const content = await readFile(filePath, "utf-8");
    const info = await stat(filePath);
    const hash = md5(content);

    // Compare with previous snapshot
    const prev = await loadSnapshot(name);
    let diff: DiffLine[] | null = null;
    let prevSnapshotAt: string | null = null;

    if (prev && prev.hash !== hash) {
      diff = computeDiff(prev.content, content);
      prevSnapshotAt = prev.savedAt;
      // Save new snapshot since content changed
      await saveSnapshot(name, hash, content);
    } else if (!prev) {
      // First time — save initial snapshot
      await saveSnapshot(name, hash, content);
    }
    // If hash matches, keep existing snapshot (no update needed)

    return {
      name,
      type,
      modifiedAt: info.mtime.toISOString(),
      sizeBytes: Buffer.byteLength(content),
      lineCount: content.split("\n").length,
      hash,
      content,
      staleDays: daysBetween(info.mtime, now),
      diff,
      prevSnapshotAt,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const now = new Date();
    const entries: TimelineEntry[] = [];

    // MEMORY.md
    const mem = await readEntry(
      join(WORKSPACE, "MEMORY.md"),
      "MEMORY.md",
      "longterm",
      now
    );
    if (mem) entries.push(mem);

    // Daily memory files
    const memoryDir = join(WORKSPACE, "memory");
    try {
      const dailyFiles = await readdir(memoryDir);
      for (const f of dailyFiles
        .filter((f) => f.endsWith(".md"))
        .sort()
        .reverse()) {
        const entry = await readEntry(
          join(memoryDir, f),
          f,
          "daily",
          now
        );
        if (entry) entries.push(entry);
      }
    } catch {
      // no memory dir
    }

    // Workspace files
    const wsFiles = ["SOUL.md", "USER.md", "HEARTBEAT.md"];
    for (const wf of wsFiles) {
      const entry = await readEntry(
        join(WORKSPACE, wf),
        wf,
        "workspace",
        now
      );
      if (entry) entries.push(entry);
    }

    // Missing daily files
    const startDate = new Date("2026-02-14");
    const missingDays: string[] = [];
    const existingDailyNames = new Set(
      entries.filter((e) => e.type === "daily").map((e) => e.name)
    );
    for (
      let d = new Date(startDate);
      d <= now;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = d.toISOString().split("T")[0];
      const fileName = `${dateStr}.md`;
      if (!existingDailyNames.has(fileName)) {
        missingDays.push(dateStr);
      }
    }

    return NextResponse.json({
      entries,
      missingDays,
      summary: {
        totalFiles: entries.length,
        dailyCount: entries.filter((e) => e.type === "daily").length,
        missingDayCount: missingDays.length,
        oldestStale: Math.max(...entries.map((e) => e.staleDays)),
        lastUpdate: entries.reduce(
          (latest, e) =>
            e.modifiedAt > latest ? e.modifiedAt : latest,
          ""
        ),
      },
    });
  } catch {
    return NextResponse.json(
      { entries: [], missingDays: [], summary: null },
      { status: 500 }
    );
  }
}
