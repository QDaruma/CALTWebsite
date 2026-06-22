import { icons, type LucideProps } from "lucide-react";

/**
 * Render an icon by name. Two forms are supported:
 *  - a lucide icon PascalCase name (e.g. "Grid3x3"), falling back to a circle;
 *  - a text glyph via the "text:" prefix (e.g. "text:G"), drawn as a bold letter
 *    so math tasks can show a representative symbol lucide does not provide.
 */
export function Icon({ name, size = 24, className, ...props }: { name: string } & LucideProps) {
  if (name.startsWith("text:")) {
    const glyph = name.slice(5);
    const px = typeof size === "number" ? size : 24;
    return (
      <span
        aria-hidden
        className={className}
        style={{ fontSize: px, lineHeight: 1, fontWeight: 800 }}
      >
        {glyph}
      </span>
    );
  }
  const Cmp = (icons as Record<string, React.ComponentType<LucideProps>>)[name] ?? icons.Circle;
  return <Cmp size={size} className={className} {...props} />;
}
