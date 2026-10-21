
require("dotenv").config();

const { generateCodeReview } = require("../src/services/ai/code-review.service");

const testCodeReview = async () => {
  try {
    const result = await generateCodeReview({
      language: "javascript",
      requirements: "The function should add two numbers correctly.",
      code: `
function add(a, b) {
  return a - b;
}

const result = add(2, 3);
console.log(result);
`,
    });

    console.log(
      "AI Code Review Test Result:\n",
      JSON.stringify(result, null, 2)
    );
  } catch (error) {
    console.error("AI Code Review test failed:", error.message);
    process.exitCode = 1;
  }
};

testCodeReview();
