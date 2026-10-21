jest.mock("../src/config/database", () => ({
  codeSubmission: {
    findFirst: jest.fn(),
  },
}));

jest.mock("../src/services/static-analysis/static-analysis.service", () => ({
  runStaticAnalysis: jest.fn(),
}));

jest.mock("../src/services/ai/code-review.service", () => ({
  generateCodeReview: jest.fn(),
}));

jest.mock("../src/services/review.service", () => ({
  saveReview: jest.fn(),
}));

const prisma = require("../src/config/database");
const { runStaticAnalysis } = require("../src/services/static-analysis/static-analysis.service");
const { generateCodeReview } = require("../src/services/ai/code-review.service");
const { saveReview } = require("../src/services/review.service");
const { createConsolidatedReview } = require("../src/services/consolidated-review.service");

describe("Consolidated Review Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("throws 404 when the submission does not exist or is not owned by the user", async () => {
    prisma.codeSubmission.findFirst.mockResolvedValueOnce(null);

    await expect(
      createConsolidatedReview({
        submissionId: "missing-submission",
        userId: "test-user",
      })
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Submission not found",
    });

    expect(runStaticAnalysis).not.toHaveBeenCalled();
    expect(generateCodeReview).not.toHaveBeenCalled();
    expect(saveReview).not.toHaveBeenCalled();
  });

  test("does not save an AI review if Gemini fails", async () => {
    prisma.codeSubmission.findFirst.mockResolvedValueOnce({
      id: "test-submission",
      code: "const x = 1;",
      language: "javascript",
      requirements: null,
    });

    runStaticAnalysis.mockResolvedValueOnce({
      status: "completed",
      errorCount: 0,
      warningCount: 0,
      results: [],
    });

    const error = new Error("AI review service is temporarily unavailable");
    error.statusCode = 503;
    generateCodeReview.mockRejectedValueOnce(error);

    await expect(
      createConsolidatedReview({
        submissionId: "test-submission",
        userId: "test-user",
      })
    ).rejects.toMatchObject({
      statusCode: 503,
    });

    expect(saveReview).not.toHaveBeenCalled();
  });
});
