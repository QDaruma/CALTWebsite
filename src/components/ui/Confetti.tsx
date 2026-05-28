import { motion } from "framer-motion";

const COLORS = ["#5546e6", "#9333ea", "#22c55e", "#f59e0b", "#ec4899"];

// A lightweight, one-shot confetti burst (no dependency).
export function Confetti({ count = 16 }: { count?: number }) {
  const pieces = Array.from({ length: count }, (_, i) => i);
  return (
    <div className="pointer-events-none absolute inset-0 flex items-start justify-center overflow-hidden">
      {pieces.map((i) => {
        const angle = (i / count) * Math.PI - Math.PI / 2;
        const dist = 120 + Math.random() * 160;
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist + 40;
        return (
          <motion.span
            key={i}
            initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
            animate={{ opacity: 0, x, y, rotate: Math.random() * 360, scale: 0.6 }}
            transition={{ duration: 1 + Math.random() * 0.6, ease: "easeOut" }}
            className="absolute top-6 h-2 w-2 rounded-[2px]"
            style={{ backgroundColor: COLORS[i % COLORS.length] }}
          />
        );
      })}
    </div>
  );
}
