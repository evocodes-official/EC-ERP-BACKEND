const Project = require('../models/project');
const Task = require('../models/task');
const config = require('../config/jwt');

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find().lean();

    const projectsWithTasks = await Promise.all(projects.map(async (project) => {
      const tasks = await Task.find({ projectId: project._id }).lean();
      return { ...project, id: project._id, tasks };
    }));

    res.status(200).json({
      success: true,
      count: projectsWithTasks.length,
      data: projectsWithTasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching projects",
      error: config.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.createProject = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    const newProject = await Project.create({ name, description, color });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: {
        ...newProject.toObject(),
        id: newProject._id,
        tasks: []
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while creating project",
      error: config.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProject = await Project.findByIdAndDelete(id);

    if (!deletedProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    await Task.deleteMany({ projectId: id });

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
      data: { id },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while deleting project",
      error: config.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};