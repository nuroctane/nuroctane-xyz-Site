import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({
  origin: [
    "https://nuroctane.xyz",
    /^https:\/\/nuroctane-xyz(?:-site)?(?:-.*)?\.vercel\.app$/,
    /^https?:\/\/localhost(?::\d+)?$/,
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use((req, res, next) => {
  // Default: no cache for auth routes, light cache elsewhere to protect free tier
  if (req.path.includes('/auth/') || req.method !== 'GET') {
    res.setHeader('Cache-Control', 'private, no-store');
  }
  next();
});
app.use("/api", router);

export default app;
