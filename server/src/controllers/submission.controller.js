const {
  createSubmissionSchema,
  
} = require("../validators/submission.validator");

const {
  createSubmission,
  getProjectSubmissions,
    getSubmissionById,
} = require("../services/submission.service");

const create = async (req, res) => {
  try {
    const validatedData = createSubmissionSchema.parse(req.body);

    const submission = await createSubmission({
      projectId: req.params.projectId,
      userId: req.user.id,
      ...validatedData,
    });

    return res.status(201).json({
      success: true,
      message: "Code submission created successfully",
      data: {
        submission,
      },
    });
  } catch (error) {
    console.error("Create submission error:", error);

    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const getAll = async (req, res) => {
  try {
    const submissions = await getProjectSubmissions({
      projectId: req.params.projectId,
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      data: {
        submissions,
      },
    });
  } catch (error) {
    console.error("Get project submissions error:", error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getOne = async (req, res) => {
  try {
    const submission = await getSubmissionById({
      submissionId: req.params.submissionId,
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      data: {
        submission,
      },
    });
  } catch (error) {
    console.error("Get submission error:", error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  create,
    getAll,
    getOne,
};