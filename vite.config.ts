import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" keeps asset paths relative so the built site works from any
// subfolder (e.g. when copied into docs/ for GitHub Pages).
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        // Split heavy, independently-cacheable libraries out of the app chunk so
        // the initial download is smaller and vendor code is cached across deploys.
        manualChunks: {
          react: ["react", "react-dom"],
          motion: ["framer-motion"],
          prism: ["prismjs"],
        },
      },
    },
  },
});
