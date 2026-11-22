const express = require("express");

const {
  register,
  login,
  getCurrentUser,
  refresh,
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  deleteAccount,
} = require("../controllers/auth.controller");

const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getCurrentUser);
router.post("/refresh", refresh);
router.post("/logout", logout);

router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.delete("/me", authenticate, deleteAccount);

module.exports = router;
