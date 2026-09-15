const prisma = require("../config/database");

const createProject = async ({ userId, name, description }) => {
  const project = await prisma.project.create({
    data: {
      userId,
      name,
      description: description || null,
    },
  });

  return project;
};
const getUserProjects = async (userId) => {
  const projects = await prisma.project.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return projects;
};
const getProjectById = async ({ projectId, userId }) => {
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

  return project;
};

const updateProject = async ({
  projectId,
  userId,
  name,
  description,
}) => {
  const existingProject = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
    },
  });

  if (!existingProject) {
    const error = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  const project = await prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      name,
      description: description || null,
    },
  });

  return project;
};

const deleteProject = async ({ projectId, userId }) => {
  const existingProject = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
    },
  });

  if (!existingProject) {
    const error = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  await prisma.project.delete({
    where: {
      id: projectId,
    },
  });

  return existingProject;
};

module.exports = {
  createProject,
    getUserProjects,
    getProjectById,
    updateProject,
    deleteProject,
};