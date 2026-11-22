require("dotenv").config();

const express = require("express");
const cors = require("cors");
const prisma = require("./config/database");
const { apiLimiter, authLimiter, aiReviewLimiter } = require("./middleware/rate-limit.middleware");
const authRoutes = require("./routes/auth.routes");
const telemetryRoutes = require("./routes/telemetry.routes");
const projectRoutes = require("./routes/project.routes");
const submissionRoutes = require("./routes/submission.routes");
const staticAnalysisRoutes = require("./routes/static-analysis.routes");
const aiReviewRoutes = require("./routes/ai-review.routes");
const reviewHistoryRoutes = require("./routes/review-history.routes");
const consolidatedReviewRoutes = require("./routes/consolidated-review.routes");

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
  })
);

app.use(express.json({ limit: "200kb" }));
app.use("/api", apiLimiter);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Code Review API is running",
  });
});

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

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/telemetry", telemetryRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/projects", submissionRoutes);
app.use("/api/submissions", aiReviewLimiter, staticAnalysisRoutes);
app.use("/api/submissions", aiReviewLimiter, aiReviewRoutes);
app.use("/api/submissions", reviewHistoryRoutes);
app.use("/api/submissions", aiReviewLimiter, consolidatedReviewRoutes);

module.exports = app;
