import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "/" agar aset tetap benar saat halaman dibuka lewat rute bersih
// (mis. /peta atau /fakultas/fisipol) di hosting seperti Vercel.
export default defineConfig({
  base: "/",
  plugins: [react()],
  build: {
    outDir: "dist",
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1600,
  },
});
