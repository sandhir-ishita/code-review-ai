const { runStaticAnalysis } = require("../services/static-analysis/static-analysis.service");

const analyze = async (req, res) => {
  try {
    const analysis = await runStaticAnalysis({
      submissionId: req.params.submissionId,
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Static analysis completed successfully",
      data: {
        analysis,
      },
    });
  } catch (error) {
    console.error("Static analysis controller error:", error);

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
  analyze,
};