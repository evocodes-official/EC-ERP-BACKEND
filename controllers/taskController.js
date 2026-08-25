const Task = require('../models/task');

// Create a new task inside a project
exports.createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, category, categoryColor, dueDate, assigneeInitials, assigneeBg } = req.body;

    const randomIdNum = Math.floor(100 + Math.random() * 900);
    const taskId = `DT-${randomIdNum}`;

    const newTask = await Task.create({
      taskId,
      projectId,
      title,
      category,
      categoryColor,
      status: 'todo',
      dueDate,
      assigneeInitials,
      assigneeBg: assigneeBg || (assigneeInitials === 'AG' ? 'bg-amber-600' : 'bg-blue-600')
    });

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update task details or drag-and-drop status changes
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const updateData = req.body;

    const updatedTask = await Task.findOneAndUpdate({ taskId }, updateData, { new: true });
    if (!updatedTask) return res.status(404).json({ message: 'Task not found' });

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const deletedTask = await Task.findOneAndDelete({ taskId });
    
    if (!deletedTask) return res.status(404).json({ message: 'Task not found' });

    res.status(200).json({ message: 'Task deleted successfully', taskId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};