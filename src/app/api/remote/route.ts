import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const REMOTE_HOST = "wine_ny@100.72.168.70";
const SSH_TIMEOUT_MS = 5000;
const PROJECT_DIR = "~/side-project";

interface RemoteProject {
  name: string;
  branch?: string;
  lastCommit?: string;
}

async function sshExec(command: string): Promise<string> {
  const { stdout } = await execAsync(
    `ssh -o ConnectTimeout=3 -o StrictHostKeyChecking=no ${REMOTE_HOST} "${command}"`,
    { timeout: SSH_TIMEOUT_MS }
  );
  return stdout.trim();
}

export async function GET() {
  try {
    // Check connectivity + get project list in one SSH call
    const script = `
      ls -1 ${PROJECT_DIR} 2>/dev/null | head -30
    `;
    const projectList = await sshExec(script);
    const projectNames = projectList.split("\n").filter(Boolean);

    // Get git info for each project (batch in single SSH call)
    const gitScript = projectNames
      .map(
        (name) =>
          `cd ${PROJECT_DIR}/${name} 2>/dev/null && git rev-parse --abbrev-ref HEAD 2>/dev/null && git log -1 --format='%s|%ar' 2>/dev/null || echo "no-git"`
      )
      .join(" && echo '---SEPARATOR---' && ");

    let gitInfoRaw = "";
    try {
      gitInfoRaw = await sshExec(gitScript);
    } catch {
      // git info is optional
    }

    const gitBlocks = gitInfoRaw
      ? gitInfoRaw.split("---SEPARATOR---").map((b) => b.trim())
      : [];

    const projects: RemoteProject[] = projectNames.map((name, i) => {
      const block = gitBlocks[i] || "";
      const lines = block.split("\n").filter(Boolean);

      if (lines[0] === "no-git" || lines.length < 2) {
        return { name };
      }

      const branch = lines[0];
      const lastCommit = lines[1];
      return { name, branch, lastCommit };
    });

    return NextResponse.json({
      online: true,
      hostname: "macbook-pro-77",
      ip: "100.72.168.70",
      projects,
    });
  } catch {
    return NextResponse.json({
      online: false,
      hostname: "macbook-pro-77",
      ip: "100.72.168.70",
      projects: [],
    });
  }
}
