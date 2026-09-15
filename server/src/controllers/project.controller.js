const { createProjectSchema } = require("../validators/project.validator");

const {
  createProject,
  getUserProjects,
    getProjectById,
    updateProject,
    deleteProject
} = require("../services/project.service");

const create = async (req, res) => {
  try {
    const validatedData = createProjectSchema.parse(req.body);

    const project = await createProject({
      userId: req.user.id,
      ...validatedData,
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: {
        project,
      },
    });
  } catch (error) {
    console.error("Create project error:", error);

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

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getAll = async (req, res) => {
  try {
    const projects = await getUserProjects(req.user.id);

    return res.status(200).json({
      success: true,
      data: {
        projects,
      },
    });
  } catch (error) {
    console.error("Get projects error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const getOne = async (req, res) => {
  try {
    const project = await getProjectById({
      projectId: req.params.projectId,
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      data: {
        project,
      },
    });
  } catch (error) {
    console.error("Get project error:", error);

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

const update = async (req, res) => {
  try {
    const validatedData = createProjectSchema.parse(req.body);

    const project = await updateProject({
      projectId: req.params.projectId,
      userId: req.user.id,
      ...validatedData,
    });

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: {
        project,
      },
    });
  } catch (error) {
    console.error("Update project error:", error);

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

const remove = async (req, res) => {
  try {
    await deleteProject({
      projectId: req.params.projectId,
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);

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
    update,
    remove,
};