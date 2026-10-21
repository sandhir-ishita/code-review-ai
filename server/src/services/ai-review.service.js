


const prisma = require("../config/database");
const { generateCodeReview } = require("./ai/code-review.service");
const { saveReview } = require("./review.service");


const createAIReview = async ({ submissionId, userId }) => {
  // 1. Fetch the submission and verify ownership.
  const submission = await prisma.codeSubmission.findFirst({
    where: {
      id: submissionId,
      project: {
        userId,
      },
    },
  });

  if (!submission) {
    const error = new Error("Submission not found");
    error.statusCode = 404;
    throw error;
  }

  // 2. Generate the AI review.
  const reviewResult = await generateCodeReview({
    code: submission.code,
    language: submission.language,
    requirements: submission.requirements,
  });

  // 3. Save the review and its issues in the database.
  const savedReview = await saveReview({
    submissionId: submission.id,
    reviewResult,
  });

  return savedReview;
};

module.exports = { createAIReview };
