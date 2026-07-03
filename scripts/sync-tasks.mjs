// Refreshes the bundled task snapshot from the CALT framework on GitHub.
//
// It shallow-clones the framework repo into a temp folder, runs the bundler
// against it (which regenerates src/generated/projectFiles.ts), then deletes
// the temp clone. Requires `git` on PATH and network access.
//
//   npm run sync:tasks                 # uses the default repo+branch below
//   CALT_REPO_URL=<url> npm run sync:tasks             # override the source repo
//   CALT_REPO_BRANCH=<branch> npm run sync:tasks       # override the branch
//
// IMPORTANT: the default points at the repo+branch that actually holds all the
// shown tasks (QDaruma/CALTCode @ feat/encoder-only-handoff). Do NOT point this
// at HiroshiKERA/calt-codebase main today: it only has 2 of the 6 tasks, so a
// sync would produce a truncated bundle. (bundle-tasks.mjs now refuses to drop
// previously-bundled tasks, so such a mistake aborts instead of silently
// deleting them — but keep the default honest anyway.)

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoUrl = process.env.CALT_REPO_URL || "https://github.com/QDaruma/CALTCode";
const repoBranch = process.env.CALT_REPO_BRANCH || "feat/encoder-only-handoff";

const tmp = mkdtempSync(join(tmpdir(), "caltcode-"));
try {
  console.log(`Cloning ${repoUrl} (branch ${repoBranch}) ...`);
  execFileSync("git", ["clone", "--depth", "1", "--branch", repoBranch, repoUrl, tmp], { stdio: "inherit" });

  console.log("Bundling from the fresh clone ...");
  execFileSync("node", [join(scriptDir, "bundle-tasks.mjs"), tmp], { stdio: "inherit" });

  console.log("\nDone. Review the changes to src/generated/projectFiles.ts, then commit.");
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
