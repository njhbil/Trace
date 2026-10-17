import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" supaya build hasilnya bisa dibuka langsung (file:// / sub-folder / hosting apa pun)
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    outDir: "dist",
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1600,
  },
});
