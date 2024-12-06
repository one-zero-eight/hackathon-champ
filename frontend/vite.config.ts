import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const env = loadEnv("all", process.cwd());
const apiUrl = env.VITE_API_URL as string;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({
      quoteStyle: "double",
      semicolons: true,
    }),
    react(),
    tsconfigPaths(),
  ],
  server: {
    port: 3500,
    proxy: {
      "/api": {
        target: apiUrl,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
