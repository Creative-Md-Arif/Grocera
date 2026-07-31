/* eslint-disable no-undef */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isDevelopment = mode === "development";

  return {
    plugins: [react()],

    server: {
      historyApiFallback: true, // SPA routing support
      proxy: isDevelopment
        ? {
            "/api": {
              target: "http://localhost:8000",
              changeOrigin: true,
              secure: false,
            },
            "/uploads": {
              target: "http://localhost:8000",
              changeOrigin: true,
            },
            "/socket.io": {
              target: "http://localhost:8000",
              ws: true,
              changeOrigin: true,
            },
          }
        : undefined,
    },

    resolve: {
      alias: {
        "@redux": path.resolve(__dirname, "src/redux"),
        "@components": path.resolve(__dirname, "src/components"),
        "@pages": path.resolve(__dirname, "src/pages"),
        "@utils": path.resolve(__dirname, "src/utils"),
      },
    },

    build: {
      sourcemap: false,
      outDir: "dist",
      cssCodeSplit: false, 
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
            redux: ["@reduxjs/toolkit", "react-redux"],
            "admin-ui": ["antd"],
            ui: ["framer-motion", "lucide-react", "react-icons"],
            charts: ["apexcharts", "react-apexcharts"],
          },
        },
      },
    },

    // ⭐ Production-এ environment variables expose
    define: {
      __API_URL__: JSON.stringify(process.env.VITE_API_URL),
    },
  };
});
