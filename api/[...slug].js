module.exports = async (req, res) => {
  const { default: app } = await import("../artifacts/api-server/dist/vercel.mjs");
  return app(req, res);
};
