const prisma = require("../config/database");

const createSubmission = async ({
  projectId,
  userId,
  code,
  language,
  requirements,
}) => {
  // Make sure the project belongs to the authenticated user
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
    },
  });

  if (!project) {
    const error = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  const submission = await prisma.codeSubmission.create({
    data: {
      projectId,
      code,
      language,
      requirements: requirements || null,
    },
  });

  return submission;
};

const getProjectSubmissions = async ({
  projectId,
  userId,
}) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
    },
  });

  if (!project) {
    const error = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  const submissions = await prisma.codeSubmission.findMany({
    where: {
      projectId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return submissions;
};

const getSubmissionById = async ({
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

  return submission;
};

module.exports = {
  createSubmission,
  getProjectSubmissions,
  getSubmissionById,
};