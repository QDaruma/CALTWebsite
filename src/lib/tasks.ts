// Registry of the real CALT example tasks bundled from the repo (see
// scripts/bundle-tasks.mjs). Display name + summary come from i18n (keyed by id);
// here we keep the visual metadata and SageMath requirement.

import { BUNDLED_TASKS } from "../generated/projectFiles";

export interface TaskMeta {
  id: string; // repo folder name, e.g. "parity"
  icon: string; // lucide icon name (no digits, so the dynamic map resolves it)
  tagline: string; // language-neutral "input -> output" hint
  needsSage?: boolean;
  extraDeps?: string[];
}

const META: Record<string, Omit<TaskMeta, "id">> = {
  parity: { icon: "ArrowLeftRight", tagline: "2 0 1  →  +1 / -1" },
  groebner_basis: { icon: "Sigma", tagline: "f1 | f2  →  Gröbner basis", needsSage: true },
  border_basis: { icon: "LayoutGrid", tagline: "g1 | g2 | g3  →  border basis", needsSage: true },
};

const ALLOWED_TASKS = new Set(["parity", "groebner_basis", "border_basis"]);

/** All bundled example tasks, in a stable order, with their display metadata. */
export const TASKS: TaskMeta[] = BUNDLED_TASKS
  .filter((id) => ALLOWED_TASKS.has(id))
  .map((id) => ({
    id,
    icon: META[id]?.icon ?? "Boxes",
    tagline: META[id]?.tagline ?? "",
    needsSage: META[id]?.needsSage,
    extraDeps: META[id]?.extraDeps,
  }));

export function getTaskMeta(id: string): TaskMeta | undefined {
  return TASKS.find((t) => t.id === id);
}
