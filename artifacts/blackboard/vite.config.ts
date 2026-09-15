import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import cesium from "vite-plugin-cesium";

export default defineConfig(async ({ command }) => {
  let server: import("vite").ServerOptions | undefined;
  let preview: import("vite").PreviewOptions | undefined;

  // Dev has no Worker process, so /api is proxied to the deployed Worker —
  // same secrets, same KV, same admin flow as production. Point
  // API_PROXY_TARGET at a local `npx wrangler dev` (http://127.0.0.1:8787)
  // to test against the gitignored .dev.vars instead.
  const apiProxy = {
    "/api": {
      target: process.env.API_PROXY_TARGET || "https://www.nuroctane.xyz",
      changeOrigin: true,
    },
  };

  if (command !== "build") {
    const rawPort = process.env.PORT ?? "5173";
    const port = Number(rawPort);
    if (Number.isNaN(port) || port <= 0) {
      throw new Error(`Invalid PORT value: "${rawPort}"`);
    }
    server = {
      port,
      strictPort: true,
      host: "0.0.0.0",
      allowedHosts: true,
      fs: { strict: true },
      proxy: apiProxy,
    };
    preview = {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
      proxy: apiProxy,
    };
  }

  const basePath = process.env.BASE_PATH ?? "/";

  return {
    base: basePath,
    plugins: [react(), (cesium as any)()],
    optimizeDeps: {
      exclude: ["swisseph-wasm", "cesium"],
    },
    assetsInclude: ["**/*.wasm"],
    css: {
      postcss: {
        plugins: [
          (await import("tailwindcss")).default,
          (await import("autoprefixer")).default,
        ],
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
      },
      dedupe: ["react", "react-dom", "three"],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      // Keep outDir relative so vite-plugin-cesium's path.join(root,outDir) works on Windows
      outDir: "dist/public",
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: {
            "vendor-three": [
              "three",
              "@react-three/fiber",
              "@react-three/drei",
              "@react-three/postprocessing",
              "postprocessing",
            ],
            "vendor-react": ["react", "react-dom", "wouter", "zod"],
            "vendor-ui": [
              "@radix-ui/react-dialog",
              "@radix-ui/react-dropdown-menu",
              "@radix-ui/react-popover",
              "@radix-ui/react-select",
              "@radix-ui/react-tabs",
              "@radix-ui/react-tooltip",
              "framer-motion",
              "lucide-react",
              "clsx",
              "tailwind-merge",
              "class-variance-authority",
            ],
            "vendor-charts": ["recharts", "embla-carousel-react", "react-resizable-panels"],
            "vendor-astro": ["astronomy-engine", "swisseph-wasm"],
          },
        },
      },
    },
    server,
    preview,
  };
});
