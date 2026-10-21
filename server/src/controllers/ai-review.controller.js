
const { createAIReview } = require("../services/ai-review.service");

const createReview = async (req, res) => {
  try {
    const review = await createAIReview({
      submissionId: req.params.submissionId,
      userId: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "AI code review completed successfully",
      data: { review },
    });
  } catch (error) {
    console.error("AI review controller error:", error.message);

    const statusCode =
      error.statusCode ||
      (error.status === 503 || error.status === "UNAVAILABLE" ? 503 : 500);

    const message =
      statusCode === 503
        ? "AI review service is temporarily unavailable. Please try again later."
        : error.statusCode
          ? error.message
          : "AI code review failed";

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

module.exports = { createReview };
