require("dotenv").config();

const express = require("express");
const cors = require("cors");
const prisma = require("./config/database");
const authRoutes = require("./routes/auth.routes");
const projectRoutes = require("./routes/project.routes");
const submissionRoutes = require("./routes/submission.routes");
const staticAnalysisRoutes = require("./routes/static-analysis.routes");
const aiReviewRoutes = require("./routes/ai-review.routes");
const reviewHistoryRoutes = require("./routes/review-history.routes");
const consolidatedReviewRoutes = require("./routes/consolidated-review.routes");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
  })
);

app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Code Review API is running",
  });
});

// Database connection test
app.get("/api/db-test", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      message: "Database connection successful",
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/projects", submissionRoutes);
app.use("/api/submissions", staticAnalysisRoutes);
app.use("/api/submissions", aiReviewRoutes);
app.use("/api/submissions", reviewHistoryRoutes);
app.use("/api/submissions", consolidatedReviewRoutes);

module.exports = app;
