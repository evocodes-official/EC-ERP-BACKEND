const Project = require('../models/project');
const Task = require('../models/task');

// Get all projects with their tasks populated or embedded
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find().lean();
    
    // Fetch tasks for each project to match your frontend state requirements
    const projectsWithTasks = await Promise.all(projects.map(async (project) => {
      const tasks = await Task.find({ projectId: project._id }).lean();
      return { ...project, id: project._id, tasks };
    }));

    res.status(200).json(projectsWithTasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new project workspace
exports.createProject = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const newProject = await Project.create({ name, description, color });
    
    res.status(201).json({ 
      ...newProject.toObject(), 
      id: newProject._id, 
      tasks: [] 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProject = await Project.findByIdAndDelete(id);
    
    if (!deletedProject) return res.status(404).json({ message: 'Project not found' });

    // Also remove tasks associated with this project
    await Task.deleteMany({ projectId: id });

    res.status(200).json({ message: 'Project deleted successfully', id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};