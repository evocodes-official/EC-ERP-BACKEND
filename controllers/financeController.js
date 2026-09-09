const Invoice = require("../models/Invoice");
const Expense = require("../models/Expense");
const Payment = require("../models/Payment");
const config = require("../config/jwt");

const getFinanceStats = async (req, res) => {
  try {
    const [
      revenueAgg,
      outstandingAgg,
      expensesAgg,
      taxesAgg,
      paymentsAgg,
      invoiceStatusCounts,
    ] = await Promise.all([
      Invoice.aggregate([
        { $match: { status: "PAID" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Invoice.aggregate([
        { $match: { status: { $in: ["PENDING", "OVERDUE"] } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Expense.aggregate([
        { $match: { status: "PAID" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Expense.aggregate([
        { $match: { category: "TAXES" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Payment.aggregate([
        { $match: { status: "COMPLETED" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Invoice.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$amount" } } },
      ]),
    ]);

    const revenue = revenueAgg[0]?.total || 0;
    const expenses = expensesAgg[0]?.total || 0;
    const taxes = taxesAgg[0]?.total || 0;
    const netProfit = revenue - expenses;
    const margin = revenue > 0 ? Math.round((netProfit / revenue) * 1000) / 10 : 0;

    const invoicesByStatus = {};
    invoiceStatusCounts.forEach((s) => {
      invoicesByStatus[s._id] = { count: s.count, total: s.total };
    });

    res.status(200).json({
      success: true,
      data: {
        revenue,
        expenses,
        netProfit,
        netProfitMargin: `${margin}%`,
        taxes,
        outstanding: outstandingAgg[0]?.total || 0,
        paymentsReceived: paymentsAgg[0]?.total || 0,
        invoicesByStatus,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching finance stats",
      error: config.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

module.exports = {
  getFinanceStats,
};