import { icons, type LucideProps } from "lucide-react";

/** Render a lucide icon by its PascalCase name, falling back to a circle. */
export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const Cmp = (icons as Record<string, React.ComponentType<LucideProps>>)[name] ?? icons.Circle;
  return <Cmp {...props} />;
}
