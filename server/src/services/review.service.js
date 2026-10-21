
const prisma = require("../config/database");

const saveReview = async ({
  submissionId,
  reviewResult,
  model = "gemini-flash-latest",
}) => {
  return prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        submissionId,
        status: "completed",
        overallScore: reviewResult.overallScore,
        category: reviewResult.category,
        summary: reviewResult.summary,
        strengths: reviewResult.strengths,
        weaknesses: reviewResult.weaknesses,
        recommendations: reviewResult.recommendations,
        model,
        completedAt: new Date(),
        issues: {
          create: reviewResult.issues.map((issue) => ({
            type: issue.type,
            severity: issue.severity,
            title: issue.title,
            description: issue.description,
            lineNumber: issue.lineNumber,
            suggestion: issue.suggestion,
          })),
        },
      },
      include: {
        issues: true,
      },
    });

    return review;
  });
};

module.exports = { saveReview };
