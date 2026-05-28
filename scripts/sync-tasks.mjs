// Refreshes the bundled task snapshot from the CALT framework on GitHub.
//
// It shallow-clones the framework repo into a temp folder, runs the bundler
// against it (which regenerates src/generated/projectFiles.ts), then deletes
// the temp clone. Requires `git` on PATH and network access.
//
//   npm run sync:tasks                 # uses the default repo below
//   CALT_REPO_URL=<url> npm run sync:tasks   # override the source repo

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoUrl = process.env.CALT_REPO_URL || "https://github.com/HiroshiKERA/calt-codebase";

const tmp = mkdtempSync(join(tmpdir(), "caltcode-"));
try {
  console.log(`Cloning ${repoUrl} ...`);
  execFileSync("git", ["clone", "--depth", "1", repoUrl, tmp], { stdio: "inherit" });

  console.log("Bundling from the fresh clone ...");
  execFileSync("node", [join(scriptDir, "bundle-tasks.mjs"), tmp], { stdio: "inherit" });

  console.log("\nDone. Review the changes to src/generated/projectFiles.ts, then commit.");
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
