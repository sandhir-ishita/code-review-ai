
const express = require("express");

const { createReview } = require("../controllers/ai-review.controller");
const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/:submissionId/review", authenticate, createReview);

module.exports = router;
