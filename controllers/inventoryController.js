const Inventory = require("../models/Inventory");
const config = require("../config/jwt");

const getInventoryItems = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { sku: { $regex: req.query.search, $options: "i" } },
      ];
    }
    const items = await Inventory.find(filter).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching inventory items",
      error: config.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

const getInventoryItemById = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }
    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching inventory item",
      error: config.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

const createInventoryItem = async (req, res) => {
  try {
    const { name, sku } = req.body;

    if (!name || !sku) {
      return res.status(400).json({
        success: false,
        message: "Product name and SKU are required",
      });
    }

    const existing = await Inventory.findOne({
      sku: String(sku).toUpperCase(),
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `SKU "${sku}" already exists`,
      });
    }

    const item = await Inventory.create(req.body);

    res.status(201).json({
      success: true,
      message: "Inventory item created successfully",
      data: item,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Failed to create inventory item",
      error: config.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

const updateInventoryItem = async (req, res) => {
  try {
    const { sku } = req.body;

    if (sku) {
      const duplicate = await Inventory.findOne({
        sku: String(sku).toUpperCase(),
        _id: { $ne: req.params.id },
      });
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: `SKU "${sku}" already exists`,
        });
      }
    }

    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Inventory item updated successfully",
      data: item,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Failed to update inventory item",
      error: config.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

const deleteInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Inventory item deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error while deleting inventory item",
      error: config.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

module.exports = {
  getInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
};