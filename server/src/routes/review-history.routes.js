
const express = require("express");

const {
  getReviewHistory,
} = require("../controllers/review-history.controller");

const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/:submissionId/history", authenticate, getReviewHistory);

module.exports = router;
