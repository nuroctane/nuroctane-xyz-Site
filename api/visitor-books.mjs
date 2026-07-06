// Isolated books function: serves exactly /api/visitor-books (GET + POST).
// Separate bundle so modkeys/gallery changes can never break the books API.
import app from "../artifacts/api-server/dist/vercel-books.mjs";
export default app;
