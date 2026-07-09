import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(async ({ command }) => {
  // PORT is only needed to run the dev/preview server (not production builds).
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

  // Served at domain root on Vercel; override with BASE_PATH if hosting under a subpath.
  const basePath = process.env.BASE_PATH ?? "/";

  return {
    base: basePath,
    plugins: [react()],
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
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: {
            // Split the heavy, rarely-changing stacks out of the main chunk so
            // they cache independently and fetch in parallel.
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
