const Invoice = require("../models/Invoice");
const Employee = require("../models/HR");
const config = require("../config/jwt");

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const DEPT_COLORS = {
  Engineering: "bg-blue-600",
  Design: "bg-cyan-500",
  Sales: "bg-purple-600",
  Marketing: "bg-pink-500",
  HR: "bg-emerald-500",
  Finance: "bg-amber-500",
};

// Parses a date range string like "Jul 01 - Sep 30, 2024" into { start, end }.
// Falls back to the last 90 days when the value cannot be parsed.
const parseDateRange = (dateRange) => {
  const endOfDay = (date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  try {
    if (dateRange && typeof dateRange === "string") {
      const [rawStart, rawEnd] = dateRange.split(/\s+-\s+/);
      if (rawStart && rawEnd) {
        const start = new Date(`${rawStart}, ${rawEnd.split(",")[1].trim()}`);
        const end = endOfDay(new Date(rawEnd));
        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end) {
          return { start, end };
        }
      }
    }
  } catch (e) {
    // fall through to default range
  }

  const end = endOfDay(new Date());
  const start = new Date();
  start.setDate(start.getDate() - 90);
  return { start, end };
};

const getReports = async (req, res) => {
  try {
    const { dateRange, parameter } = req.query;
    const { start, end } = parseDateRange(dateRange);

    // Monthly revenue aggregated from invoices within the selected range
    const monthlyAgg = await Invoice.aggregate([
      { $match: { issueDate: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: {
            year: { $year: "$issueDate" },
            month: { $month: "$issueDate" },
          },
          revenue: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthlyData = monthlyAgg.map((m) => ({
      month: MONTH_NAMES[m._id.month - 1] || `M${m._id.month}`,
      revenue: Math.round(m.revenue * 100) / 100,
    }));

    // Revenue growth rate comparing the two most recent months
    let revenueGrowthRate = 0;
    if (monthlyData.length >= 2) {
      const last = monthlyData[monthlyData.length - 1].revenue;
      const prev = monthlyData[monthlyData.length - 2].revenue;
      revenueGrowthRate = prev > 0
        ? Math.round(((last - prev) / prev) * 1000) / 10
        : last > 0
          ? 100
          : 0;
    }

    // Department breakdown based on employee headcount
    const deptAgg = await Employee.aggregate([
      { $group: { _id: "$dept", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const totalEmployees = deptAgg.reduce((sum, d) => sum + d.count, 0);
    const departmentBreakdown = deptAgg.map((d) => ({
      name: d._id,
      color: DEPT_COLORS[d._id] || "bg-slate-400",
      percentage: totalEmployees > 0 ? `${Math.round((d.count / totalEmployees) * 100)}%` : "0%",
    }));

    // Global performance score derived from average employee performance
    const perfAgg = await Employee.aggregate([
      { $group: { _id: null, avgPerformance: { $avg: "$performance" } } },
    ]);
    const globalPerformanceScore = perfAgg.length && perfAgg[0].avgPerformance != null
      ? Math.round(perfAgg[0].avgPerformance)
      : 0;

    res.status(200).json({
      success: true,
      filters: { dateRange: dateRange || null, parameter: parameter || null, start, end },
      data: {
        revenueGrowthRate,
        globalPerformanceScore,
        monthlyData,
        departmentBreakdown,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error while generating reports",
      error: config.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

module.exports = { getReports };
