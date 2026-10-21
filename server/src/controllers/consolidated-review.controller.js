
const {
  createConsolidatedReview,
} = require("../services/consolidated-review.service");

const createConsolidated = async (req, res) => {
  try {
    const report = await createConsolidatedReview({
      submissionId: req.params.submissionId,
      userId: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Consolidated code review completed successfully",
      data: { report },
    });
  } catch (error) {
    console.error("Consolidated review error:", error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Consolidated code review failed",
    });
  }
};

module.exports = { createConsolidated };
