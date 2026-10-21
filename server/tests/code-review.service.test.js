jest.mock("../src/services/ai/gemini.service", () => ({
  ai: {
    models: {
      generateContent: jest.fn(),
    },
  },
}));

const { ai } = require("../src/services/ai/gemini.service");
const { generateCodeReview } = require("../src/services/ai/code-review.service");

describe("Code Review Service error handling", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("maps Gemini 503 errors to statusCode 503", async () => {
    const error = new Error(
      '{"error":{"code":503,"message":"This model is currently experiencing high demand","status":"UNAVAILABLE"}}'
    );
    error.status = 503;

    ai.models.generateContent.mockRejectedValueOnce(error);

    await expect(
      generateCodeReview({
        code: "function add(a, b) { return a + b; }",
        language: "javascript",
        requirements: "Add two numbers",
      })
    ).rejects.toMatchObject({
      statusCode: 503,
      message:
        "AI review service is temporarily unavailable. Please try again later.",
    });
  });

  test("maps Gemini 429 errors to statusCode 429", async () => {
    const error = new Error("Quota exceeded");
    error.status = 429;

    ai.models.generateContent.mockRejectedValueOnce(error);

    await expect(
      generateCodeReview({
        code: "function add(a, b) { return a + b; }",
        language: "javascript",
        requirements: "Add two numbers",
      })
    ).rejects.toMatchObject({
      statusCode: 429,
      message: "AI review limit reached. Please try again later.",
    });
  });
});
