const Scale = require("../models/Scale");

// @desc    Get all scales
// @route   GET /api/scales
// @access  Public
const getScales = async (req, res) => {
  try {
    const scales = await Scale.find();
    res.status(200).json({
      success: true,
      count: scales.length,
      data: scales,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching scales",
      error: err.message,
    });
  }
};

// @desc    Get single scale by ID
// @route   GET /api/scales/:id
// @access  Public
const getScaleById = async (req, res) => {
  try {
    const scale = await Scale.findById(req.params.id);
    if (!scale) {
      return res.status(404).json({
        success: false,
        message: "Scale not found",
      });
    }
    res.status(200).json({
      success: true,
      data: scale,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching scale",
      error: err.message,
    });
  }
};

// @desc    Create a new scale
// @route   POST /api/scales
// @access  Public
const createScale = async (req, res) => {
  try {
    const scale = await Scale.create(req.body);
    res.status(201).json({
      success: true,
      message: "Scale created successfully",
      data: scale,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Scale with this serial number already exists",
      });
    }
    res.status(400).json({
      success: false,
      message: "Failed to create scale",
      error: err.message,
    });
  }
};

// @desc    Update an existing scale
// @route   PUT /api/scales/:id
// @access  Public
const updateScale = async (req, res) => {
  try {
    const scale = await Scale.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!scale) {
      return res.status(404).json({
        success: false,
        message: "Scale not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Scale updated successfully",
      data: scale,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Scale with this serial number already exists",
      });
    }
    res.status(400).json({
      success: false,
      message: "Failed to update scale",
      error: err.message,
    });
  }
};

// @desc    Delete a scale
// @route   DELETE /api/scales/:id
// @access  Public
const deleteScale = async (req, res) => {
  try {
    const scale = await Scale.findByIdAndDelete(req.params.id);
    if (!scale) {
      return res.status(404).json({
        success: false,
        message: "Scale not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Scale deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error while deleting scale",
      error: err.message,
    });
  }
};

module.exports = {
  getScales,
  getScaleById,
  createScale,
  updateScale,
  deleteScale,
};