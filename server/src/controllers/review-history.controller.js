
const prisma = require("../config/database");

const getReviewHistory = async (req, res) => {
  try {
    const { submissionId } = req.params;

    // Verify that the submission belongs to the authenticated user.
    const submission = await prisma.codeSubmission.findFirst({
      where: {
        id: submissionId,
        project: {
          userId: req.user.id,
        },
      },
      select: {
        id: true,
      },
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    const reviews = await prisma.review.findMany({
      where: {
        submissionId,
      },
      include: {
        issues: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Review history retrieved successfully",
      data: {
        reviews,
      },
    });
  } catch (error) {
    console.error("Review history error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve review history",
    });
  }
};

module.exports = { getReviewHistory };
