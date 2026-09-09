const Task = require('../models/task');
const config = require('../config/jwt');

exports.createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, category, categoryColor, dueDate, assigneeInitials, assigneeBg } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Task title is required",
      });
    }

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

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: newTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while creating task",
      error: config.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const updateData = req.body;

    const updatedTask = await Task.findOneAndUpdate({ taskId }, updateData, { returnDocument: 'after' });
    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: updatedTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while updating task",
      error: config.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const deletedTask = await Task.findOneAndDelete({ taskId });

    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: { taskId },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while deleting task",
      error: config.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};