import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import cesium from "vite-plugin-cesium";

export default defineConfig(async ({ command }) => {
  let server: import("vite").ServerOptions | undefined;
  let preview: import("vite").PreviewOptions | undefined;

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
    };
    preview = {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
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
        "@assets": path.resolve(
          import.meta.dirname,
          "..",
          "..",
          "attached_assets",
        ),
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
          },
        },
      },
    },
    server,
    preview,
  };
});
