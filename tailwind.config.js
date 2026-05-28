/** @type {import('tailwindcss').Config} */
const ink = (n) => `rgb(var(--ink-${n}) / <alpha-value>)`;

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["SFMono-Regular", "Consolas", "Liberation Mono", "Menlo", "monospace"],
      },
      colors: {
        // Theme-aware neutral scale (inverts in dark mode via CSS variables).
        ink: {
          50: ink(50),
          100: ink(100),
          200: ink(200),
          300: ink(300),
          400: ink(400),
          500: ink(500),
          600: ink(600),
          700: ink(700),
          800: ink(800),
          900: ink(900),
        },
        // Card / input background (white in light, dark slate in dark).
        surface: "rgb(var(--surface) / <alpha-value>)",
        // High-contrast bubble (dark in light theme, light in dark theme).
        inverse: "rgb(var(--inverse) / <alpha-value>)",
        "inverse-fg": "rgb(var(--inverse-fg) / <alpha-value>)",
        brand: {
          50: "rgb(var(--brand-50) / <alpha-value>)",
          100: "rgb(var(--brand-100) / <alpha-value>)",
          200: "#c6ccff",
          300: "#a3abfc",
          400: "#7e84f7",
          500: "#635bf0",
          600: "#5546e6",
          700: "rgb(var(--brand-700) / <alpha-value>)",
          800: "#3b2fa1",
          900: "#332d7f",
        },
        accent: {
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
        },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)",
        card: "0 1px 2px rgba(16, 24, 40, 0.03), 0 4px 16px -4px rgba(16, 24, 40, 0.08)",
        lifted: "0 8px 28px -8px rgba(16, 24, 40, 0.16), 0 2px 6px rgba(16, 24, 40, 0.06)",
        glow: "0 0 0 1px rgba(85, 70, 230, 0.12), 0 12px 32px -8px rgba(85, 70, 230, 0.35)",
        ring: "0 0 0 4px rgba(99, 91, 240, 0.14)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.4s ease-out both",
        "scale-in": "scale-in 0.3s cubic-bezier(0.16,1,0.3,1) both",
        shimmer: "shimmer 3s linear infinite",
        float: "float 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
