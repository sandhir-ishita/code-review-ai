const express = require("express");

const { analyze } = require("../controllers/static-analysis.controller");
const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/:submissionId/analyze", authenticate, analyze);

module.exports = router;