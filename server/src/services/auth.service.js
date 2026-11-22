const crypto = require("crypto");
const bcrypt = require("bcrypt");
const prisma = require("../config/database");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("./token.service");
const { sendVerificationEmail, sendPasswordResetEmail } = require("./email.service");
const { hashToken } = require("../utils/token.utils");

const TOKEN_TYPES = { EMAIL_VERIFY: "EMAIL_VERIFY", PASSWORD_RESET: "PASSWORD_RESET" };

async function createOneTimeToken(userId, type, ttlMs) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  await prisma.verificationToken.updateMany({ where: { userId, type, usedAt: null }, data: { usedAt: new Date() } });
  await prisma.verificationToken.create({ data: { userId, type, tokenHash, expiresAt: new Date(Date.now() + ttlMs) } });
  return rawToken;
}

const registerUser = async ({ name, email, password }) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) { const error = new Error("User with this email already exists"); error.statusCode = 409; throw error; }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
    select: { id: true, name: true, email: true, isEmailVerified: true, createdAt: true },
  });
  try {
    const rawToken = await createOneTimeToken(user.id, TOKEN_TYPES.EMAIL_VERIFY, 24 * 60 * 60 * 1000);
    await sendVerificationEmail({ to: user.email, name: user.name, rawToken });
  } catch (mailError) { console.error("Failed to send verification email:", mailError); }
  return user;
};

const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) { const error = new Error("Invalid email or password"); error.statusCode = 401; throw error; }
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) { const error = new Error("Invalid email or password"); error.statusCode = 401; throw error; }
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  await prisma.refreshToken.create({ data: { userId: user.id, tokenHash: hashToken(refreshToken), expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });
  return { user: { id: user.id, name: user.name, email: user.email, isEmailVerified: user.isEmailVerified, createdAt: user.createdAt }, accessToken, refreshToken };
};

const refreshAccessToken = async (refreshToken) => {
  let decoded;
  try { decoded = verifyRefreshToken(refreshToken); } catch { const e = new Error("Invalid or expired refresh token"); e.statusCode = 401; throw e; }
  const tokenHash = hashToken(refreshToken);
  const storedToken = await prisma.refreshToken.findFirst({ where: { tokenHash, userId: decoded.userId, revokedAt: null } });
  if (!storedToken) { const e = new Error("Invalid or revoked refresh token"); e.statusCode = 401; throw e; }
  if (storedToken.expiresAt <= new Date()) { const e = new Error("Refresh token has expired"); e.statusCode = 401; throw e; }
  const user = await prisma.user.findUnique({ where: { id: decoded.userId }, select: { id: true } });
  if (!user) { const e = new Error("User not found"); e.statusCode = 401; throw e; }
  const newAccessToken = generateAccessToken(user.id);
  const newRefreshToken = generateRefreshToken(user.id);
  await prisma.$transaction([
    prisma.refreshToken.update({ where: { id: storedToken.id }, data: { revokedAt: new Date() } }),
    prisma.refreshToken.create({ data: { userId: user.id, tokenHash: hashToken(newRefreshToken), expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } }),
  ]);
  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

const logoutUser = async (refreshToken) => {
  const tokenHash = hashToken(refreshToken);
  const storedToken = await prisma.refreshToken.findFirst({ where: { tokenHash, revokedAt: null } });
  if (!storedToken) return;
  await prisma.refreshToken.update({ where: { id: storedToken.id }, data: { revokedAt: new Date() } });
};

const verifyEmailToken = async (rawToken) => {
  const tokenHash = hashToken(rawToken);
  const record = await prisma.verificationToken.findUnique({ where: { tokenHash } });
  if (!record || record.type !== TOKEN_TYPES.EMAIL_VERIFY || record.usedAt) { const e = new Error("Invalid or already used verification link"); e.statusCode = 400; throw e; }
  if (record.expiresAt <= new Date()) { const e = new Error("Verification link has expired. Please request a new one."); e.statusCode = 400; throw e; }
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { isEmailVerified: true } }),
    prisma.verificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);
};

const resendVerificationEmail = async (email) => {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, email: true, isEmailVerified: true } });
  if (!user || user.isEmailVerified) return;
  const rawToken = await createOneTimeToken(user.id, TOKEN_TYPES.EMAIL_VERIFY, 24 * 60 * 60 * 1000);
  await sendVerificationEmail({ to: user.email, name: user.name, rawToken });
};

const requestPasswordReset = async (email) => {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, email: true } });
  if (!user) return;
  const rawToken = await createOneTimeToken(user.id, TOKEN_TYPES.PASSWORD_RESET, 60 * 60 * 1000);
  await sendPasswordResetEmail({ to: user.email, name: user.name, rawToken });
};

const resetPasswordWithToken = async ({ token, password }) => {
  const tokenHash = hashToken(token);
  const record = await prisma.verificationToken.findUnique({ where: { tokenHash } });
  if (!record || record.type !== TOKEN_TYPES.PASSWORD_RESET || record.usedAt) { const e = new Error("Invalid or already used password reset link"); e.statusCode = 400; throw e; }
  if (record.expiresAt <= new Date()) { const e = new Error("Password reset link has expired. Please request a new one."); e.statusCode = 400; throw e; }
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.verificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    prisma.refreshToken.updateMany({ where: { userId: record.userId, revokedAt: null }, data: { revokedAt: new Date() } }),
  ]);
};

const deleteUserAccount = async ({ userId, password }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) { const e = new Error("User not found"); e.statusCode = 404; throw e; }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) { const e = new Error("Incorrect password"); e.statusCode = 401; throw e; }
  await prisma.user.delete({ where: { id: userId } });
};

module.exports = {
  deleteUserAccount, registerUser, loginUser, refreshAccessToken, logoutUser, verifyEmailToken, resendVerificationEmail, requestPasswordReset, resetPasswordWithToken };