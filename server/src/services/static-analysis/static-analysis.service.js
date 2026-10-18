const prisma = require("../../config/database");
const { analyzeJavaScript } = require("./eslint.service");

const runStaticAnalysis = async ({
  submissionId,
  userId,
}) => {
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

  if (
    submission.language !== "javascript" &&
    submission.language !== "typescript"
  ) {
    const error = new Error("Static analysis is not supported for this language");
    error.statusCode = 400;
    throw error;
  }

  let analysisResult;

  try {
    analysisResult = await analyzeJavaScript(submission.code);
  } catch (error) {
    console.error("ESLint analysis error:", error);

    const analysis = await prisma.staticAnalysis.create({
      data: {
        submissionId,
        tool: "eslint",
        status: "failed",
        errorCount: 0,
        warningCount: 0,
        results: {
          message: "Static analysis failed",
        },
      },
    });

    return analysis;
  }

  const analysis = await prisma.staticAnalysis.create({
    data: {
      submissionId,
      tool: "eslint",
      status: "completed",
      errorCount: analysisResult.errorCount,
      warningCount: analysisResult.warningCount,
      results: analysisResult.messages,
    },
  });

  return analysis;
};

module.exports = {
  runStaticAnalysis,
};