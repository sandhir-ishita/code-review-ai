const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  deleteAccountSchema,
} = require("../validators/auth.validator");

const {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  verifyEmailToken,
  resendVerificationEmail,
  requestPasswordReset,
  resetPasswordWithToken,
  deleteUserAccount,
} = require("../services/auth.service");

const prisma = require("../config/database");

function handleControllerError(res, error, label) {
  console.error(`${label} error: `, error);

  if (error.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (error.statusCode) {
    return res.status(error.statusCode).json({

      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}

const register = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const user = await registerUser(validatedData);

    return res.status(201).json({

      success: true,
      message: "User registered successfully. Please check your email to verify your account.",
      data: { user },
    });
  } catch (error) {
    return handleControllerError(res, error, "Register");
  }
};

const login = async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const loginResult = await loginUser(validatedData);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: loginResult,
    });
  } catch (error) {
    return handleControllerError(res, error, "Login");
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({

        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({

      success: true,
      data: { user },
    });
  } catch (error) {
    return handleControllerError(res, error, "Get current user");
  }
};

const refresh = async (req, res) => {
  try {
    const validatedData = refreshTokenSchema.parse(req.body);
    const result = await refreshAccessToken(validatedData.refreshToken);

    return res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      data: result,
    });
  } catch (error) {
    return handleControllerError(res, error, "Refresh token");
  }
};

const logout = async (req, res) => {
  try {
    const validatedData = refreshTokenSchema.parse(req.body);
    await logoutUser(validatedData.refreshToken);

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    return handleControllerError(res, error, "Logout");
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = verifyEmailSchema.parse(req.body);
    await verifyEmailToken(token);

    return res.status(200).json({

      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    return handleControllerError(res, error, "Verify email");
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = resendVerificationSchema.parse(req.body);
    await resendVerificationEmail(email);

    return res.status(200).json({
      success: true,
      message: "If an unverified account exists with that email, a verification link has been sent.",
    });
  } catch (error) {
    return handleControllerError(res, error, "Resend verification");
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    await requestPasswordReset(email);

    return res.status(200).json({
      success: true,
      message: "If an account exists with that email, a password reset link has been sent.",
    });
  } catch (error) {
    return handleControllerError(res, error, "Forgot password");
  }
};

const resetPassword = async (req, res) => {
  try {
    const validatedData = resetPasswordSchema.parse(req.body);
    await resetPasswordWithToken(validatedData);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now sign in with your new password.",
    });
  } catch (error) {
    return handleControllerError(res, error, "Reset password");
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { password } = deleteAccountSchema.parse(req.body);
    await deleteUserAccount({ userId: req.user.id, password });
    return res.status(200).json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    return handleControllerError(res, error, "Delete account");
  }
};

module.exports = {
  deleteAccount,
  register,
  login,
  getCurrentUser,
  refresh,
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
};
