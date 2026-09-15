const { z } = require("zod");

const createSubmissionSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Code is required")
    .max(100000, "Code must not exceed 100,000 characters"),

  language: z
    .string()
    .trim()
    .toLowerCase()
    .refine(
      (value) => ["javascript", "typescript"].includes(value),
      "Only JavaScript and TypeScript are supported"
    ),

  requirements: z
    .string()
    .trim()
    .max(10000, "Requirements must not exceed 10,000 characters")
    .optional(),
});

module.exports = {
  createSubmissionSchema,
};