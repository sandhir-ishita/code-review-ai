const { z } = require("zod");

const emailField = z
  .string()
  .trim()
  .email("Please provide a valid email address")
  .transform((value) => value.toLowerCase());

const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(100, "Password must not exceed 100 characters");

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name must not exceed 50 characters"),
  email: emailField,
  password: passwordField,
});

const loginSchema = z.object({

  email: emailField,
  password: z.string().min(1, "Password is required"),
});

const refreshTokenSchema = z.object({

  refreshToken: z.string().min(1, "Refresh token is required"),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

const resendVerificationSchema = z.object({
  email: emailField,
});

const forgotPasswordSchema = z.object({
  email: emailField,
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: passwordField,
});

const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required to delete your account"),
});

module.exports = {
  deleteAccountSchema,
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
