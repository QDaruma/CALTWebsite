// Regenerates the bundled task snapshot (src/generated/projectFiles.ts).
//
// The site is SELF-CONTAINED: the task sources are vendored into this repo under
// `task-sources/`, so regeneration needs no network and no external repo.
//
//   npm run sync:tasks                       # regenerate from vendored task-sources/
//   npm run bundle                           # same thing (direct bundler call)
//
// Optional — refresh the vendored copy from a remote (only useful while that
// remote still exists; the original CALTCode staging repo is being deleted):
//
//   CALT_REPO_URL=<url> npm run sync:tasks
//   CALT_REPO_URL=<url> CALT_REPO_BRANCH=<branch> npm run sync:tasks
//
// This shallow-clones the remote, re-vendors its task folders + shared/ into
// task-sources/ (excluding data/outputs), then bundles. Review the diff to both
// task-sources/ and src/generated/projectFiles.ts before committing.

import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(scriptDir, "..");
const vendorDir = resolve(siteRoot, "task-sources");
const bundler = join(scriptDir, "bundle-tasks.mjs");

const repoUrl = process.env.CALT_REPO_URL || "";
const repoBranch = process.env.CALT_REPO_BRANCH || "";

// Directory names that are generated output, never vendored.
const EXCLUDE = (name) => name === "data" || /^data_/.test(name) ||
  name === "outputs" || name === "__pycache__" || name === ".git";

function revendorFrom(srcRoot) {
  // Copy every top-level folder that looks like a task (has core/generator.py)
  // plus shared/, into task-sources/, minus generated data/outputs.
  for (const entry of readdirSync(srcRoot)) {
    const abs = join(srcRoot, entry);
    if (!statSync(abs).isDirectory()) continue;
    const isTask = existsSync(join(abs, "core", "generator.py"));
    if (!isTask && entry !== "shared") continue;
    const dest = join(vendorDir, entry);
    rmSync(dest, { recursive: true, force: true });
    cpSync(abs, dest, {
      recursive: true,
      filter: (s) => !EXCLUDE(basename(s)),
    });
    console.log(`  re-vendored ${entry}/`);
  }
}

if (repoUrl) {
  const tmp = mkdtempSync(join(tmpdir(), "calt-src-"));
  try {
    const cloneArgs = ["clone", "--depth", "1"];
    if (repoBranch) cloneArgs.push("--branch", repoBranch);
    cloneArgs.push(repoUrl, tmp);
    console.log(`Refreshing task-sources/ from ${repoUrl}${repoBranch ? ` (branch ${repoBranch})` : ""} ...`);
    execFileSync("git", cloneArgs, { stdio: "inherit" });
    revendorFrom(tmp);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
} else {
  console.log(`Self-contained: bundling from vendored ${vendorDir}`);
}

console.log("Bundling ...");
execFileSync("node", [bundler], { stdio: "inherit" });
console.log("\nDone. Review the diff to src/generated/projectFiles.ts (and task-sources/ if refreshed), then commit.");
