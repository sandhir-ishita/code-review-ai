const express = require("express");

const {
  create,
  getAll,
    getOne,
} = require("../controllers/submission.controller");

const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/:projectId/submissions", authenticate, create);
router.get("/:projectId/submissions", authenticate, getAll);
router.get("/submission/:submissionId", authenticate, getOne);

module.exports = router;