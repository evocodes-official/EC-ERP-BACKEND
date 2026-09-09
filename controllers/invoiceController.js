const Invoice = require("../models/Invoice");
const config = require("../config/jwt");

const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const count = await Invoice.countDocuments({
    invoiceNumber: new RegExp(`^INV-${year}-`),
  });
  let seq = count + 1;
  let invoiceNumber = `INV-${year}-${String(seq).padStart(3, "0")}`;

  while (await Invoice.exists({ invoiceNumber })) {
    seq += 1;
    invoiceNumber = `INV-${year}-${String(seq).padStart(3, "0")}`;
  }
  return invoiceNumber;
};

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
      error: config.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

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
      error: config.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

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
      error: config.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

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
      error: config.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

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
      error: config.NODE_ENV === "development" ? err.message : undefined,
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