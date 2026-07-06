/* Isolated Vercel entry: books API only.
 * Bundled by build.mjs to dist/vercel-books.mjs and served by the root
 * api/visitor-books.mjs function. Deliberately minimal: no pino-http
 * middleware, no auth router. Route files do their own logging. */
import express from "express";
import cors from "cors";
import { Router } from "express";
import booksRouter from "./routes/books";
import healthRouter from "./routes/health";

const app = express();
app.use(cors({
  origin: [
    "https://nuroctane.xyz",
    /^https:\/\/nuroctane-xyz-site(?:-.*)?\.vercel\.app$/,
    /^https?:\/\/localhost(?::\d+)?$/,
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const router = Router();
router.use(healthRouter);
router.use(booksRouter);
app.use("/api", router);

export default app;
