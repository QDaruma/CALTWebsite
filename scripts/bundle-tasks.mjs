// Snapshots the CALT framework's task folders + shared code into a single TS
// module the site embeds, so the browser can assemble a downloadable ZIP.
//
// Two sources are combined:
//   1. The task sources (tasks + shared/). Resolved from, in order:
//        - the first CLI argument:   node scripts/bundle-tasks.mjs /path/to/tasks
//        - the CALT_REPO env var
//        - ./task-sources (the copy vendored INTO this repo — the default)
//      The vendored copy makes the site self-contained: it no longer depends on
//      any external repo to regenerate (the original CALTCode staging repo is
//      being deleted). `npm run bundle` regenerates straight from task-sources/.
//   2. The site's own project-files/ (pyproject.toml). This is a packaging file
//      the site owns, not the framework, so the calt-x pin lives here.
//      Installation is conda-based (see the generated README), so there are no
//      install scripts to bundle.
//
// A "task" is any top-level framework folder that contains core/generator.py.
// Run from the site/ directory:  node scripts/bundle-tasks.mjs [framework-path]
// Pure Node (no bundler) so it runs on any platform without native deps.

import { readdirSync, readFileSync, statSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(scriptDir, "..");
const pathArg = process.argv.slice(2).find((a) => !a.startsWith("--"));
const frameworkRoot = resolve(
  pathArg || process.env.CALT_REPO || resolve(siteRoot, "task-sources")
);
const projectFilesDir = resolve(siteRoot, "project-files");
const outFile = resolve(siteRoot, "src", "generated", "projectFiles.ts");

const ALLOWED_EXT = new Set([".py", ".yaml", ".yml", ".sh", ".md", ".toml"]);
const SKIP_DIRS = new Set(["site", "docs", ".git", "node_modules", "templates", "__pycache__", ".claude"]);

// Exclude generated datasets / training outputs (they can be huge and are rebuilt).
function isExcludedPath(relPath) {
  const parts = relPath.split("/");
  if (parts.some((p) => p === "outputs" || /^data($|_)/.test(p) || p === "data")) return true;
  if (/_raw\.txt$/.test(relPath) || /_stats\.yaml$/.test(relPath)) return true;
  return false;
}

function walk(absDir, baseForKeys, acc) {
  for (const entry of readdirSync(absDir)) {
    const abs = join(absDir, entry);
    const st = statSync(abs);
    if (st.isDirectory()) {
      if (entry === "__pycache__" || entry === "outputs" || /^data($|_)/.test(entry)) continue;
      walk(abs, baseForKeys, acc);
    } else {
      const rel = relative(baseForKeys, abs).split(sep).join("/");
      const ext = entry.slice(entry.lastIndexOf("."));
      if (!ALLOWED_EXT.has(ext)) continue;
      if (isExcludedPath(rel)) continue;
      const raw = readFileSync(abs, "utf8");
      acc[rel] = ext === ".sh" ? raw.replace(/\r\n/g, "\n") : raw;
    }
  }
}

if (!existsSync(frameworkRoot)) {
  console.error(`Framework repo not found at: ${frameworkRoot}`);
  console.error(`Pass a path or run "npm run sync:tasks" to fetch it from GitHub.`);
  process.exit(1);
}

// ---- Discover task folders in the framework repo ----
const taskNames = [];
for (const entry of readdirSync(frameworkRoot)) {
  if (SKIP_DIRS.has(entry)) continue;
  const abs = join(frameworkRoot, entry);
  if (!statSync(abs).isDirectory()) continue;
  if (existsSync(join(abs, "core", "generator.py"))) taskNames.push(entry);
}
taskNames.sort();

const taskFiles = {};
for (const name of taskNames) {
  const acc = {};
  walk(join(frameworkRoot, name), frameworkRoot, acc);
  taskFiles[name] = acc;
}

// ---- Common project files ----
const common = {};
// shared/ comes from the framework repo.
if (existsSync(join(frameworkRoot, "shared"))) walk(join(frameworkRoot, "shared"), frameworkRoot, common);
// Packaging files are owned by the site (project-files/), falling back to the
// framework repo if a file is not overridden there. A README.md is generated at
// download time, so it is not bundled here. Installation is conda-based, so no
// install scripts are bundled.
for (const f of ["pyproject.toml"]) {
  const local = join(projectFilesDir, f);
  const upstream = join(frameworkRoot, f);
  if (existsSync(local)) common[f] = readFileSync(local, "utf8");
  else if (existsSync(upstream)) common[f] = readFileSync(upstream, "utf8");
}

// ---- Snapshot stamp: records when this bundle was taken and the engine pin ----
// The calt-x pin lives in pyproject.toml (e.g. `"calt-x==1.1.0",`).
const caltLine =
  (common["pyproject.toml"] || "")
    .split("\n")
    .map((l) => l.match(/calt-x[^"',]*/))
    .find(Boolean)?.[0]
    ?.trim() || "calt-x (unpinned)";
const bundledOn = new Date().toISOString().slice(0, 10);
common["CALT_SNAPSHOT.txt"] =
  `CALT project snapshot\n` +
  `=====================\n` +
  `Bundled on : ${bundledOn}\n` +
  `Engine     : ${caltLine}\n` +
  `\n` +
  `These task files were captured by the CALT Task Builder on the date above.\n` +
  `If a task stops working after a calt-x release, check that the installed\n` +
  `calt-x matches the engine version listed here.\n`;

// ---- Safety guard: never silently drop tasks that are already bundled ----
// A wrong source (e.g. calt-codebase main, which lacks 4 of the 6 shown tasks)
// would otherwise overwrite projectFiles.ts with a truncated set. Refuse instead.
// Pass --force to override deliberately.
if (existsSync(outFile) && !process.argv.includes("--force")) {
  const prev = readFileSync(outFile, "utf8");
  const m = prev.match(/BUNDLED_TASKS: string\[\] = (\[[^\]]*\])/);
  if (m) {
    let prevTasks = [];
    try { prevTasks = JSON.parse(m[1]); } catch { prevTasks = []; }
    const missing = prevTasks.filter((t) => !taskNames.includes(t));
    if (missing.length) {
      console.error(`\nRefusing to overwrite ${relative(siteRoot, outFile).split(sep).join("/")}: this source is`);
      console.error(`missing ${missing.length} task(s) that are currently bundled: ${missing.join(", ")}`);
      console.error(`Source scanned : ${frameworkRoot}`);
      console.error(`Tasks found    : ${taskNames.join(", ") || "(none)"}`);
      console.error(`\nPoint at a source that has all tasks (see scripts/sync-tasks.mjs),`);
      console.error(`or pass --force to overwrite anyway.`);
      process.exit(1);
    }
  }
}

// ---- Emit TS ----
mkdirSync(dirname(outFile), { recursive: true });
const header = `// AUTO-GENERATED by scripts/bundle-tasks.mjs. Do not edit by hand.
// Run \`npm run bundle\` (regenerates from ./task-sources) to refresh.
/* eslint-disable */

export const BUNDLED_TASKS: string[] = ${JSON.stringify(taskNames)};

export const TASK_FILES: Record<string, Record<string, string>> = ${JSON.stringify(taskFiles)};

export const COMMON_FILES: Record<string, string> = ${JSON.stringify(common)};
`;
writeFileSync(outFile, header, "utf8");

// ---- Report ----
console.log(`Framework: ${frameworkRoot}`);
let totalBytes = 0;
for (const name of taskNames) {
  const files = taskFiles[name];
  const n = Object.keys(files).length;
  const bytes = Object.values(files).reduce((s, c) => s + c.length, 0);
  totalBytes += bytes;
  console.log(`  ${name.padEnd(22)} ${String(n).padStart(3)} files  ${(bytes / 1024).toFixed(1)} KB`);
}
const commonBytes = Object.values(common).reduce((s, c) => s + c.length, 0);
totalBytes += commonBytes;
console.log(`  ${"(common)".padEnd(22)} ${String(Object.keys(common).length).padStart(3)} files  ${(commonBytes / 1024).toFixed(1)} KB`);
console.log(`\nBundled ${taskNames.length} tasks -> ${relative(siteRoot, outFile).split(sep).join("/")}  (${(totalBytes / 1024).toFixed(1)} KB total)`);
