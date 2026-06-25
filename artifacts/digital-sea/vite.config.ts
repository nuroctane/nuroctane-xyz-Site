import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(async ({ command }) => {
  // PORT is only needed to run the dev/preview server. It is irrelevant to a
  // production build (e.g. Vercel), so only require it when serving.
  let server: import("vite").ServerOptions | undefined;
  let preview: import("vite").PreviewOptions | undefined;

  if (command !== "build") {
    const rawPort = process.env.PORT;
    if (!rawPort) {
      throw new Error(
        "PORT environment variable is required but was not provided.",
      );
    }
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

  // BASE_PATH is set by the Replit artifact system for path-based routing. When
  // building elsewhere (e.g. Vercel, served at the domain root), default to "/".
  // Still require it explicitly while serving so a misconfigured Replit dev
  // environment fails loudly instead of silently serving at the wrong path.
  const basePath =
    process.env.BASE_PATH ?? (command === "build" ? "/" : undefined);
  if (!basePath) {
    throw new Error(
      "BASE_PATH environment variable is required but was not provided.",
    );
  }

  return {
    base: basePath,
    plugins: [
      react(),
      ...(process.env.NODE_ENV !== "production" &&
      process.env.REPL_ID !== undefined
        ? [
            // cartographer is intentionally omitted: it injects data-component-name
            // onto React elements which React Three Fiber's reconciler treats as
            // Three.js property names, causing a runtime crash.
            await import("@replit/vite-plugin-dev-banner").then((m) =>
              m.devBanner(),
            ),
          ]
        : []),
    ],
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
    },
    server,
    preview,
  };
});
