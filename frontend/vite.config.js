import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react({
      babel: {
        babelrc: false,
        configFile: false,
      },
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000", // 🔴 CHANGE if backend uses 8000
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
