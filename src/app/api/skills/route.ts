import { NextResponse } from "next/server";
import { readdir, readFile, stat } from "fs/promises";
import { join } from "path";

const SKILLS_DIR = join(
  process.env.HOME || "",
  ".openclaw/workspace/skills"
);

interface Skill {
  slug: string;
  name: string;
  description: string;
  version: string;
  emoji: string;
  isZip: boolean;
}

function parseSkillFrontmatter(content: string): {
  name?: string;
  description?: string;
  emoji?: string;
} {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return {};

  const fm = fmMatch[1];
  const name = fm.match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const description = fm.match(/^description:\s*(.+)$/m)?.[1]?.trim();

  // Try to extract emoji from metadata
  const emojiMatch = fm.match(/"emoji"\s*:\s*"(.+?)"/);
  const emoji = emojiMatch?.[1];

  return { name, description, emoji };
}

export async function GET() {
  try {
    const entries = await readdir(SKILLS_DIR);
    const skills: Skill[] = [];

    for (const entry of entries) {
      // Skip zip files
      if (entry.endsWith(".zip")) continue;

      const entryPath = join(SKILLS_DIR, entry);
      const entryStat = await stat(entryPath);
      if (!entryStat.isDirectory()) continue;

      let name = entry;
      let description = "";
      let version = "";
      let emoji = "";

      // Parse _meta.json
      try {
        const meta = JSON.parse(
          await readFile(join(entryPath, "_meta.json"), "utf-8")
        );
        version = meta.version || "";
      } catch {
        // no _meta.json
      }

      // Parse SKILL.md frontmatter
      try {
        const skillMd = await readFile(
          join(entryPath, "SKILL.md"),
          "utf-8"
        );
        const parsed = parseSkillFrontmatter(skillMd);
        if (parsed.name) name = parsed.name;
        if (parsed.description) description = parsed.description;
        if (parsed.emoji) emoji = parsed.emoji;
      } catch {
        // no SKILL.md
      }

      skills.push({
        slug: entry,
        name,
        description,
        version,
        emoji: emoji || "",
        isZip: false,
      });
    }

    // Count zip-only skills (not installed)
    const zipOnly = entries.filter(
      (e) => e.endsWith(".zip") && !entries.includes(e.replace(".zip", ""))
    );

    return NextResponse.json({
      skills: skills.sort((a, b) => a.name.localeCompare(b.name)),
      zipOnlyCount: zipOnly.length,
    });
  } catch {
    return NextResponse.json({ skills: [], zipOnlyCount: 0 }, { status: 500 });
  }
}
