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
  integer_factorization: { icon: "Binary", tagline: "2310  →  2 | 3 | 5 | 7 | 11" },
  gf17_addition: { icon: "Hash", tagline: "5,9,3,4  →  5,14,0,4" },
  eigvec_3x3: { icon: "Grid3x3", tagline: "3×3 matrix  →  eigenvector" },
  polynomial_addition: { icon: "Plus", tagline: "p1 | p2 | …  →  running sums", needsSage: true },
  // border_basis intentionally dropped: it is close to Gröbner bases and less
  // popular (per the maintainers' feedback).
};

const ALLOWED_TASKS = new Set([
  "parity",
  "groebner_basis",
  "integer_factorization",
  "gf17_addition",
  "eigvec_3x3",
  "polynomial_addition",
]);

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
