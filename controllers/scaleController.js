const Scale = require("../models/Scale");
const config = require("../config/jwt");

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
      error: config.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

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
      error: config.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

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
      error: config.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

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
      error: config.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

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
      error: config.NODE_ENV === "development" ? err.message : undefined,
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