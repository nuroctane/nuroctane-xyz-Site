module.exports = async (req, res) => {
  try {
    const { default: app } = await import("../artifacts/api-server/dist/vercel.mjs");
    return app(req, res);
  } catch (err) {
    res.status(500).json({ error: "API failed to load", detail: err.message });
  }
};
