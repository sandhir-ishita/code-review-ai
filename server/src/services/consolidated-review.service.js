

const prisma = require("../config/database");
const { runStaticAnalysis } = require("./static-analysis/static-analysis.service");
const { generateCodeReview } = require("./ai/code-review.service");
const { saveReview } = require("./review.service");

const createConsolidatedReview = async ({ submissionId, userId }) => {
  // 1. Verify submission ownership and retrieve the code.
  const submission = await prisma.codeSubmission.findFirst({
    where: {
      id: submissionId,
      project: { userId },
    },
  });

  if (!submission) {
    const error = new Error("Submission not found");
    error.statusCode = 404;
    throw error;
  }

  // 2. Run static analysis. This service saves its own result.
  const staticAnalysis = await runStaticAnalysis({
    submissionId,
    userId,
  });

  // 3. Generate the AI review.
  const aiResult = await generateCodeReview({
    code: submission.code,
    language: submission.language,
    requirements: submission.requirements,
  });

  // 4. Save the AI review and its issues.
  const review = await saveReview({
    submissionId,
    reviewResult: aiResult,
  });

  // 5. Return one consolidated report.
  return {
    submissionId,
    language: submission.language,
    staticAnalysis: {
      status: staticAnalysis.status,
      errorCount: staticAnalysis.errorCount,
      warningCount: staticAnalysis.warningCount,
      results: staticAnalysis.results,
    },
    aiReview: review,
    report: {
      overallScore: aiResult.overallScore,
      category: aiResult.category,
      summary: aiResult.summary,
      strengths: aiResult.strengths,
      weaknesses: aiResult.weaknesses,
      recommendations: aiResult.recommendations,
      issues: aiResult.issues,
    },
  };
};

module.exports = { createConsolidatedReview };
