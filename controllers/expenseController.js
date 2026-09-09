const Expense = require("../models/Expense");
const config = require("../config/jwt");

const getExpenses = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category.toUpperCase();
    }
    if (req.query.status) {
      filter.status = req.query.status.toUpperCase();
    }
    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching expenses",
      error: config.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }
    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching expense",
      error: config.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

const createExpense = async (req, res) => {
  try {
    const expense = await Expense.create(req.body);
    res.status(201).json({
      success: true,
      message: "Expense created successfully",
      data: expense,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Failed to create expense",
      error: config.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      data: expense,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Failed to update expense",
      error: config.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error while deleting expense",
      error: config.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

module.exports = {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
};