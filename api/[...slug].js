module.exports = async (req, res) => {
  try {
    const { default: app } = await import("../artifacts/api-server/dist/vercel.mjs");
    return app(req, res);
  } catch (err) {
    console.error("api/[...slug].js: failed to load server:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
