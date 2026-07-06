// Isolated modkeys function: serves /api/modkeys/* (gallery GET/POST/delete).
// Separate bundle so books changes can never break the gallery API.
import app from "../../artifacts/api-server/dist/vercel-modkeys.mjs";
export default app;
