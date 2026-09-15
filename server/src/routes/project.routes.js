const express = require("express");

const {
  create,
  getAll,
  getOne,
    update,
    remove,
} = require("../controllers/project.controller");

const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", authenticate, create);
router.get("/", authenticate, getAll);
router.get("/:projectId", authenticate, getOne);
router.patch("/:projectId", authenticate, update);
router.delete("/:projectId", authenticate, remove);

module.exports = router;