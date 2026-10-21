
const express = require("express");

const {
  createConsolidated,
} = require("../controllers/consolidated-review.controller");

const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/:submissionId/consolidated-review", authenticate, createConsolidated);

module.exports = router;
