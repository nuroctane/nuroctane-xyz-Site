import { Hono } from "hono";
import { cors } from "hono/cors";
import router from "./routes";
import { logger } from "./lib/logger";

const app = new Hono();

/* Previews are versioned Worker deploys (https://<version>-nuroctane-xyz.<sub>.workers.dev),
 * which replaces the old /\.vercel\.app$/ preview pattern. */
const ALLOWED_EXACT = new Set([
  "https://nuroctane.xyz",
  "https://www.nuroctane.xyz",
]);
const ALLOWED_PATTERNS = [
  /^https:\/\/(?:[a-z0-9-]+-)?nuroctane-xyz\.[a-z0-9-]+\.workers\.dev$/,
  /^https?:\/\/localhost(?::\d+)?$/,
];

app.use(
  "*",
  cors({
    origin: (origin, c) => {
      // The CLI version endpoint is deliberately public (it was Access-Control-
      // Allow-Origin: * as a Vercel edge function, and the docs site embeds it).
      if (c.req.path === "/api/nur-cli-version") return "*";
      if (!origin) return undefined;
      if (ALLOWED_EXACT.has(origin)) return origin;
      if (ALLOWED_PATTERNS.some((re) => re.test(origin))) return origin;
      return undefined;
    },
    credentials: true,
  }),
);

app.use("*", async (c, next) => {
  // Default: no cache for auth routes and any mutation. Handlers that want a
  // cacheable GET (books, gallery, contrib) set their own header afterwards,
  // which wins.
  if (c.req.path.includes("/auth/") || c.req.method !== "GET") {
    c.header("Cache-Control", "private, no-store");
  }
  await next();
});

app.onError((err, c) => {
  logger.error({ err, path: c.req.path }, "Unhandled API error");
  return c.json({ error: "Internal server error" }, 500);
});

app.route("/api", router);

export default app;
