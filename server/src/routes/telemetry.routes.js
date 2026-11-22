const express = require("express");
const router = express.Router();

router.post("/event", (req, res) => {
  const { event, page, meta } = req.body || {};
  if (typeof event === "string" && event.length <= 100) {
    console.log(JSON.stringify({ type: "ANALYTICS", ts: new Date().toISOString(), event, page: page || null, meta: meta || null }));
  }
  res.status(204).end();
});

router.post("/error", (req, res) => {
  const { message, stack, page } = req.body || {};
  console.error(JSON.stringify({ type: "CLIENT_ERROR", ts: new Date().toISOString(), message: String(message || "Unknown error").slice(0, 500), page: page || null, stack: stack ? String(stack).slice(0, 1500) : null }));
  res.status(204).end();
});

module.exports = router;
