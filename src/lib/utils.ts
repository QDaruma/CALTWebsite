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

/** Derive a PascalCase class name from a task name, e.g. "my_task" -> "MyTaskGenerator". */
export function toGeneratorClassName(taskName: string): string {
  const snake = toSnakeCase(taskName) || "task";
  const pascal = snake
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
  return `${pascal}Generator`;
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
