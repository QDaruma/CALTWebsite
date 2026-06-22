import { Fragment, useMemo } from "react";
import { File, Folder } from "lucide-react";
import { cn } from "../../lib/utils";

// Renders a real file tree from a flat list of paths (e.g. the keys of
// projectFileMap). Folders whose name is in `notes` get a short inline caption;
// folders whose name is in `strongNotes` get a prominent badge instead (used to
// make the per-task configs/ folder stand out as the thing you customize).

interface TreeNode {
  name: string;
  path: string;
  isFile: boolean;
  children: Map<string, TreeNode>;
}

function makeNode(name: string, path: string, isFile: boolean): TreeNode {
  return { name, path, isFile, children: new Map() };
}

function buildTree(paths: string[]): TreeNode {
  const root = makeNode("", "", false);
  for (const p of paths) {
    const parts = p.split("/").filter(Boolean);
    let node = root;
    parts.forEach((part, i) => {
      const isFile = i === parts.length - 1;
      const path = parts.slice(0, i + 1).join("/");
      if (!node.children.has(part)) node.children.set(part, makeNode(part, path, isFile));
      const child = node.children.get(part)!;
      if (isFile) child.isFile = true;
      node = child;
    });
  }
  return root;
}

function sortedChildren(node: TreeNode): TreeNode[] {
  return [...node.children.values()].sort((a, b) => {
    if (a.isFile !== b.isFile) return a.isFile ? 1 : -1; // folders first
    return a.name.localeCompare(b.name);
  });
}

function Rows({
  node,
  depth,
  notes,
  strongNotes,
}: {
  node: TreeNode;
  depth: number;
  notes: Record<string, string>;
  strongNotes: Record<string, string>;
}) {
  return (
    <>
      {sortedChildren(node).map((child) => {
        const strong = !child.isFile ? strongNotes[child.name] : undefined;
        const note = !child.isFile && !strong ? notes[child.name] : undefined;
        return (
          <Fragment key={child.path}>
            <div
              className="flex items-center gap-1.5 py-0.5 text-sm"
              style={{ paddingLeft: `${depth * 16}px` }}
            >
              {child.isFile ? (
                <File size={14} className="flex-shrink-0 text-ink-400" />
              ) : (
                <Folder size={14} className="flex-shrink-0 text-brand-500" />
              )}
              <span className={cn("font-mono", child.isFile ? "text-ink-600" : "font-semibold text-ink-800")}>
                {child.name}
                {!child.isFile && "/"}
              </span>
              {strong && (
                <span className="ml-1.5 inline-flex items-center rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-soft">
                  {strong}
                </span>
              )}
              {note && <span className="ml-1.5 text-xs italic text-ink-400">{note}</span>}
            </div>
            {!child.isFile && (
              <Rows node={child} depth={depth + 1} notes={notes} strongNotes={strongNotes} />
            )}
          </Fragment>
        );
      })}
    </>
  );
}

export function FileTree({
  paths,
  notes = {},
  strongNotes = {},
}: {
  paths: string[];
  /** folder name -> muted caption shown next to it. */
  notes?: Record<string, string>;
  /** folder name -> prominent badge text (takes precedence over `notes`). */
  strongNotes?: Record<string, string>;
}) {
  const root = useMemo(() => buildTree(paths), [paths]);
  return (
    <div className="scroll-thin max-h-[420px] overflow-auto rounded-xl bg-ink-50 p-3 ring-1 ring-ink-200">
      <Rows node={root} depth={0} notes={notes} strongNotes={strongNotes} />
    </div>
  );
}
