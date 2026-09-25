import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Vendor chunks are matched by package directory, not by the object form of
// manualChunks: the object form also pulls shared helpers into whichever chunk
// claims a dependent first. It put react-dom/client's createRoot inside
// vendor-three and Vite's preload helper inside vendor-astro, so every page —
// the Blackboard home included — preloaded 1.2 MB of Three.js and astronomy.
const VENDOR_CHUNKS: Record<string, string[]> = {
  "vendor-three": ["three", "@react-three/fiber", "@react-three/drei", "@react-three/postprocessing", "postprocessing"],
  "vendor-react": ["react", "react-dom", "scheduler", "wouter", "zod"],
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
};

function vendorChunk(id: string): string | undefined {
  const normalized = id.replace(/\\/g, "/");
  // Virtual helpers every page needs. Left unassigned, Rollup folds them into
  // the first manual chunk that depends on them (swisseph-wasm's dynamic import
  // put the preload helper in vendor-astro), dragging that chunk onto every page.
  if (normalized.includes("vite/preload-helper") || normalized.includes("commonjsHelpers")) {
    return "vendor-react";
  }
  const at = normalized.lastIndexOf("/node_modules/");
  if (at === -1) return undefined;
  const rest = normalized.slice(at + "/node_modules/".length).split("/");
  const name = rest[0].startsWith("@") ? `${rest[0]}/${rest[1]}` : rest[0];
  for (const [chunk, packages] of Object.entries(VENDOR_CHUNKS)) {
    if (packages.includes(name)) return chunk;
  }
  return undefined;
}

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
    // No vite-plugin-cesium: it injected a render-blocking 5.7 MB Cesium.js into
    // every page's <head>, and no mounted Observatory mode uses Cesium (the
    // globe is UnifiedWorld on Three.js; the Cesium modes are unimported).
    plugins: [react()],
    optimizeDeps: {
      exclude: ["swisseph-wasm"],
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
      outDir: "dist/public",
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: vendorChunk,
        },
      },
    },
    server,
    preview,
  };
});
