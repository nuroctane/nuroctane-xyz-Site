// Catch-all API function (health, auth, anything without a dedicated function).
// Imports the esbuild bundle produced by `pnpm run build` (artifacts/api-server/build.mjs).
// More specific functions (api/visitor-books.mjs, api/modkeys/*) take precedence.
import app from "../artifacts/api-server/dist/vercel.mjs";
export default app;
