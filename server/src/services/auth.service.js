const bcrypt = require("bcrypt");
const prisma = require("../config/database");


const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("./token.service");

const { hashToken } = require("../utils/token.utils");

const registerUser = async ({ name, email, password }) => {
  // 1. Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    const error = new Error("User with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  // 2. Hash the password
  const passwordHash = await bcrypt.hash(password, 12);

  // 3. Create the user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  return user;
};

const loginUser = async ({ email, password }) => {
  // 1. Find user by email
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  // 2. Don't reveal whether the email exists
  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  // 3. Compare password with stored hash
  const isPasswordValid = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  // 4. Generate authentication tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  const refreshTokenHash = hashToken(refreshToken);

await prisma.refreshToken.create({
  data: {
    userId: user.id,
    tokenHash: refreshTokenHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
});

  // 5. Return safe user data + tokens
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    accessToken,
    refreshToken,
  };
};

const refreshAccessToken = async (refreshToken) => {
  // 1. Verify the refresh token
  let decoded;

  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    const authError = new Error("Invalid or expired refresh token");
    authError.statusCode = 401;
    throw authError;
  }

  // 2. Hash the received refresh token
  const tokenHash = hashToken(refreshToken);

  // 3. Find the stored refresh token
  const storedToken = await prisma.refreshToken.findFirst({
    where: {
      tokenHash,
      userId: decoded.userId,
      revokedAt: null,
    },
  });

  if (!storedToken) {
    const authError = new Error("Invalid or revoked refresh token");
    authError.statusCode = 401;
    throw authError;
  }

  // 4. Check database expiration
  if (storedToken.expiresAt <= new Date()) {
    const authError = new Error("Refresh token has expired");
    authError.statusCode = 401;
    throw authError;
  }

  // 5. Make sure the user still exists
  const user = await prisma.user.findUnique({
    where: {
      id: decoded.userId,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    const authError = new Error("User not found");
    authError.statusCode = 401;
    throw authError;
  }

  // 6. Generate new token pair
  const newAccessToken = generateAccessToken(user.id);
  const newRefreshToken = generateRefreshToken(user.id);

  // 7. Hash new refresh token
  const newRefreshTokenHash = hashToken(newRefreshToken);

  // 8. Rotate tokens inside a transaction
  await prisma.$transaction([
    prisma.refreshToken.update({
      where: {
        id: storedToken.id,
      },
      data: {
        revokedAt: new Date(),
      },
    }),

    prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: newRefreshTokenHash,
        expiresAt: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ),
      },
    }),
  ]);




  // 9. Return new token pair
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};


const logoutUser = async (refreshToken) => {
  const tokenHash = hashToken(refreshToken);

  const storedToken = await prisma.refreshToken.findFirst({
    where: {
      tokenHash,
      revokedAt: null,
    },
  });

  // Already revoked / invalid token
  // Logout should still be considered successful.
  if (!storedToken) {
    return;
  }

  await prisma.refreshToken.update({
    where: {
      id: storedToken.id,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
};