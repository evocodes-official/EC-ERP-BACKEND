const Invoice = require("../models/Invoice");

/**
 * Generate the next invoice number in the format INV-<YEAR>-<SEQ>,
 * e.g. INV-2026-001. Falls back gracefully on collisions.
 */
const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const count = await Invoice.countDocuments({
    invoiceNumber: new RegExp(`^INV-${year}-`),
  });
  let seq = count + 1;
  let invoiceNumber = `INV-${year}-${String(seq).padStart(3, "0")}`;

  // Guard against gaps/collisions in the sequence
  while (await Invoice.exists({ invoiceNumber })) {
    seq += 1;
    invoiceNumber = `INV-${year}-${String(seq).padStart(3, "0")}`;
  }
  return invoiceNumber;
};

// @desc    Get all invoices (optionally filter by ?status=PAID)
// @route   GET /api/invoices
// @access  Public
const getInvoices = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status.toUpperCase();
    }
    const invoices = await Invoice.find(filter).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching invoices",
      error: err.message,
    });
  }
};

// @desc    Get single invoice by ID
// @route   GET /api/invoices/:id
// @access  Public
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }
    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching invoice",
      error: err.message,
    });
  }
};

// @desc    Create a new invoice
// @route   POST /api/invoices
// @access  Public
const createInvoice = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.invoiceNumber) {
      payload.invoiceNumber = await generateInvoiceNumber();
    }
    const invoice = await Invoice.create(payload);
    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: invoice,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "An invoice with this invoice number already exists",
      });
    }
    res.status(400).json({
      success: false,
      message: "Failed to create invoice",
      error: err.message,
    });
  }
};

// @desc    Update an existing invoice
// @route   PUT /api/invoices/:id
// @access  Public
const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      data: invoice,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "An invoice with this invoice number already exists",
      });
    }
    res.status(400).json({
      success: false,
      message: "Failed to update invoice",
      error: err.message,
    });
  }
};

// @desc    Delete an invoice
// @route   DELETE /api/invoices/:id
// @access  Public
const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error while deleting invoice",
      error: err.message,
    });
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
};
