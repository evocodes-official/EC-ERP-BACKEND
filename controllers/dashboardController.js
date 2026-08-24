const Employee = require("../models/HR");
const { Deal, User } = require("../models/crm");

// =========================================================
// Helpers
// =========================================================

/**
 * Build an array of month metadata for the last N months.
 * Each entry: label (short month name), year, month (1-12),
 * startDate / endDate Date objects.
 */
const getLastNMonths = (n = 7) => {
  const months = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: d.toLocaleString("default", { month: "short" }),
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      startDate: new Date(d.getFullYear(), d.getMonth(), 1),
      endDate: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999),
    });
  }
  return months;
};

/** Composite key for a year-month pair. */
const monthKey = (year, month) => `${year}-${month}`;

/** Calculate percentage trend between current and previous values. */
const calcTrend = (current, previous) => {
  if (previous > 0) {
    return Math.round(((current - previous) / previous) * 1000) / 10;
  }
  return current > 0 ? 100 : 0;
};

// =========================================================
// Dashboard Controller
// =========================================================

// @desc    Get all dashboard data (KPIs, charts, hierarchy, sales)
// @route   GET /api/dashboard
// @access  Public
const getDashboardData = async (req, res) => {
  try {
    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const months = getLastNMonths(7);
    const chartStartDate = months[0].startDate;
    const chartEndDate = months[months.length - 1].endDate;

    const execRolePattern =
      /manager|director|vp|chief|officer|head|lead|president|cto|ceo|cfo|coo|cmo|cio|ciso|cxo/i;

    // Run all independent database operations in parallel
    const [
      totalEmployees,
      newHiresCurrent,
      newHiresPrevious,
      revenueCurrentAgg,
      revenuePreviousAgg,
      monthlyRevenueAgg,
      deals,
      users,
      employees,
      managers,
    ] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ joinedDate: { $gte: startOfMonth, $lt: startOfNextMonth } }),
      Employee.countDocuments({ joinedDate: { $gte: startOfLastMonth, $lt: startOfMonth } }),
      Deal.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Deal.aggregate([
        { $match: { createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Deal.aggregate([
        { $match: { createdAt: { $gte: chartStartDate, $lte: chartEndDate } } },
        {
          $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      Deal.find().lean(),
      User.find().lean(),
      Employee.find().lean(),
      Employee.find({ role: { $regex: execRolePattern } }).sort({ joinedDate: 1 }).limit(6).lean(),
    ]);

    // ---- KPIs ----
    const totalEmployeesValue = totalEmployees;
    const employeeTrend = calcTrend(newHiresCurrent, newHiresPrevious);

    const monthlyRevenue = revenueCurrentAgg.length > 0 ? revenueCurrentAgg[0].total : 0;
    const prevRevenue = revenuePreviousAgg.length > 0 ? revenuePreviousAgg[0].total : 0;
    const revenueTrend = calcTrend(monthlyRevenue, prevRevenue);

    // ---- Revenue vs Expenses chart (last 7 months) ----
    const revenueMap = {};
    for (const item of monthlyRevenueAgg) {
      revenueMap[monthKey(item._id.year, item._id.month)] = item.total;
    }
    const monthLabels = months.map((m) => m.label);
    const revenueByMonth = months.map((m) => revenueMap[monthKey(m.year, m.month)] || 0);
    // Expenses: no finance/expense model exists yet — return zeros
    const expensesByMonth = new Array(months.length).fill(0);

    // ---- Sales by Department ----
    // Chain: Deal.assigneeId -> User._id -> User.name -> Employee.name -> Employee.dept
    const userIdToName = {};
    for (const user of users) {
      userIdToName[user._id.toString()] = user.name;
    }
    const nameToDept = {};
    for (const emp of employees) {
      if (emp.name) {
        nameToDept[emp.name.toLowerCase().trim()] = emp.dept;
      }
    }
    const deptSales = {};
    for (const deal of deals) {
      if (!deal.assigneeId) continue;
      const assigneeName = userIdToName[deal.assigneeId.toString()];
      if (assigneeName) {
        const dept = nameToDept[assigneeName.toLowerCase().trim()];
        if (dept) {
          deptSales[dept] = (deptSales[dept] || 0) + (deal.amount || 0);
        }
      }
    }

    const totalDeptSales = Object.values(deptSales).reduce((sum, v) => sum + v, 0);
    const salesByDepartment = Object.entries(deptSales)
      .map(([dept, revenue]) => ({
        dept,
        revenue: Math.round(revenue),
        percentage: totalDeptSales > 0 ? Math.round((revenue / totalDeptSales) * 100) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // ---- Management Hierarchy ----
    const managementHierarchy = managers.map((emp) => ({
      name: emp.name,
      role: emp.role,
      avatar: emp.avatar || "",
      dept: emp.dept,
      status: emp.attendance === "O.O.O" ? "away" : "active",
    }));

    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        kpis: {
          totalEmployees: {
            value: totalEmployeesValue,
            trend: employeeTrend,
            trendDirection: employeeTrend >= 0 ? "up" : "down",
          },
          activeProjects: null,
          monthlyRevenue: {
            value: monthlyRevenue,
            trend: revenueTrend,
            trendDirection: revenueTrend >= 0 ? "up" : "down",
          },
          pendingTasks: null,
        },
        revenueVsExpenses: {
          months: monthLabels,
          revenue: revenueByMonth,
          expenses: expensesByMonth,
        },
        salesByDepartment,
        managementHierarchy,
        recentActivity: [],
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard data",
      error: err.message,
    });
  }
};

module.exports = {
  getDashboardData,
};
