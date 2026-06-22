// Small helpers shared across the app.

/** Join class names, dropping falsy values. */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

/**
 * Turn an arbitrary label into a valid Python module / folder name
 * (snake_case, starts with a letter, only [a-z0-9_]).
 */
export function toSnakeCase(input: string): string {
  const cleaned = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
  if (!cleaned) return "";
  // Module names must not start with a digit.
  return /^[0-9]/.test(cleaned) ? `task_${cleaned}` : cleaned;
}

/** Derive a PascalCase class name from a task name, e.g. "my_task" -> "MyTask". */
export function toGeneratorClassName(taskName: string): string {
  const snake = toSnakeCase(taskName) || "task";
  const pascal = snake
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
  return pascal || "Task";
}

/**
 * Keep previously-seeded generator code in sync when the task name changes.
 *
 * The generator class name is derived from the task name, and the generated
 * scripts/generate.py imports that derived name. When a user renames the task
 * after the editor was seeded, the frozen code would still declare the old class
 * (e.g. `MyTask`) while generate.py imports the new one (`BigGroebner`), an
 * ImportError. This renames the class definition (and the header comment) inside
 * the stored code so the two stay consistent.
 */
export function renameTaskInCode(code: string, oldName: string, newName: string): string {
  if (!code) return code;
  let out = code;

  const oldClass = toGeneratorClassName(oldName);
  const newClass = toGeneratorClassName(newName);
  // Class names are [A-Za-z0-9]+, so a \b word-boundary match is safe.
  if (oldClass !== newClass) {
    out = out.replace(new RegExp(`\\b${oldClass}\\b`, "g"), newClass);
  }

  // Header comment: "...pairs for the <name> task." (literal replace, no regex).
  const oldDisplay = oldName.trim() || "my_task";
  const newDisplay = newName.trim() || "my_task";
  if (oldDisplay !== newDisplay) {
    out = out.split(`for the ${oldDisplay} task`).join(`for the ${newDisplay} task`);
  }

  return out;
}

/** Is this a valid Python identifier (for stat keys, etc.)? */
export function isValidIdentifier(name: string): boolean {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name);
}

/** A human-friendly check that a task name is usable. Returns an error string or null. */
export function validateTaskName(name: string): string | null {
  if (!name.trim()) return "Please enter a task name.";
  const snake = toSnakeCase(name);
  if (!snake) return "Use letters, numbers, spaces, hyphens or underscores.";
  if (snake.length > 40) return "That name is a bit long, keep it under 40 characters.";
  return null;
}

/** Download a Blob as a file in the browser. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
