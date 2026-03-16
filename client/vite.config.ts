import path from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwind from "tailwindcss";
import autoprefixer from "autoprefixer";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
  base: "/",
  css: {
    postcss: {
      plugins: [tailwind(), autoprefixer()],
    },
  },
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    __APP_ID__: JSON.stringify("invest-calculator"),
  },
  server: {
    port: 6209,
  },
  esbuild:
    process.env.NODE_ENV === "production"
      ? { drop: ["console", "debugger"] }
      : {},
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild",
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name].[hash][extname]",
        chunkFileNames: "assets/[name].[hash].js",
        entryFileNames: "assets/[name].[hash].js",
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("vue") || id.includes("vue-router")) {
              return "vendor";
            }
            if (id.includes("lucide-vue-next")) {
              return "icons";
            }
            return "libs";
          }
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
});
