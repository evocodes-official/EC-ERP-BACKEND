const Payment = require("../models/Payment");
const Invoice = require("../models/Invoice");
const config = require("../config/jwt");

const getPayments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status.toUpperCase();
    }
    if (req.query.invoice) {
      filter.invoice = req.query.invoice;
    }
    const payments = await Payment.find(filter)
      .populate("invoice", "invoiceNumber client status")
      .sort({ paymentDate: -1 });
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching payments",
      error: config.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate(
      "invoice",
      "invoiceNumber client status"
    );
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }
    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching payment",
      error: config.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

const createPayment = async (req, res) => {
  try {
    const payment = await Payment.create(req.body);

    if (payment.invoice && payment.status === "COMPLETED") {
      const invoice = await Invoice.findById(payment.invoice);
      if (invoice) {
        invoice.amountPaid = (invoice.amountPaid || 0) + payment.amount;
        if (invoice.amountPaid >= invoice.amount) {
          invoice.status = "PAID";
        }
        await invoice.save();
      }
    }

    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: payment,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Failed to create payment",
      error: config.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      data: payment,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Failed to update payment",
      error: config.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error while deleting payment",
      error: config.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

module.exports = {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
};