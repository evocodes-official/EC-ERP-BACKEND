const Payment = require("../models/Payment");
const Invoice = require("../models/Invoice");

// @desc    Get all payments (optionally filter by ?status=COMPLETED or ?invoice=<id>)
// @route   GET /api/payments
// @access  Public
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
      error: err.message,
    });
  }
};

// @desc    Get single payment by ID
// @route   GET /api/payments/:id
// @access  Public
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
      error: err.message,
    });
  }
};

// @desc    Create a new payment (marks the linked invoice PAID when fully settled)
// @route   POST /api/payments
// @access  Public
const createPayment = async (req, res) => {
  try {
    const payment = await Payment.create(req.body);

    // If the payment is linked to an invoice and completed, keep the invoice in sync
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
      error: err.message,
    });
  }
};

// @desc    Update an existing payment
// @route   PUT /api/payments/:id
// @access  Public
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
      error: err.message,
    });
  }
};

// @desc    Delete a payment
// @route   DELETE /api/payments/:id
// @access  Public
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
      error: err.message,
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
