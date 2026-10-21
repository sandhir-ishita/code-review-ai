
const request = require("supertest");
const express = require("express");

jest.mock("../src/services/ai-review.service", () => ({
  createAIReview: jest.fn(),
}));

const { createAIReview } = require("../src/services/ai-review.service");
const { createReview } = require("../src/controllers/ai-review.controller");

const app = express();

app.use(express.json());

// Simulate authenticated user for this isolated controller test.
app.post("/api/submissions/:submissionId/review", (req, res, next) => {
  req.user = { id: "test-user-id" };
  next();
}, createReview);

describe("AI Review Controller error handling", () => {

    beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});
  afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});



  test("returns 503 when the AI review service is unavailable", async () => {
    const error = new Error(
      "AI review service is temporarily unavailable. Please try again later."
    );
    error.statusCode = 503;

    createAIReview.mockRejectedValueOnce(error);

    const response = await request(app)
      .post("/api/submissions/test-submission-id/review");

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      success: false,
      message:
        "AI review service is temporarily unavailable. Please try again later.",
    });
  });


  test("returns 429 when the AI review rate limit is reached", async () => {
    const error = new Error(
      "AI review limit reached. Please try again later."
    );
    error.statusCode = 429;

    createAIReview.mockRejectedValueOnce(error);

    const response = await request(app)
      .post("/api/submissions/test-submission-id/review");

    expect(response.status).toBe(429);
    expect(response.body).toEqual({
      success: false,
      message: "AI review limit reached. Please try again later.",
    });
  });


test("returns 201 when the AI review is successful", async () => {
  const mockReview = {
    id: "test-review-id",
    submissionId: "test-submission-id",
    overallScore: 85,
    category: "good",
    summary: "The code looks good.",
    issues: [],
  };

  createAIReview.mockResolvedValueOnce(mockReview);

  const response = await request(app)
    .post("/api/submissions/test-submission-id/review");

  expect(response.status).toBe(201);
  expect(response.body).toEqual({
    success: true,
    message: "AI code review completed successfully",
    data: {
      review: mockReview,
    },
  });
});


});
