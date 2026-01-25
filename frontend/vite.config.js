import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Load env variables properly for Vite config
  const env = loadEnv(mode, process.cwd(), "");

  const BACKEND_URL = env.VITE_BACKEND_URL || "http://localhost:5000";

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: BACKEND_URL,
          changeOrigin: true,
          secure: false,
        },
        "/video_feed": {
          target: BACKEND_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
