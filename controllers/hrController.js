const Employee = require("../models/HR");

// Helper: Map department to style
const getDeptStyle = (dept) => {
  switch (dept) {
    case "Engineering": return "bg-blue-50 text-blue-600";
    case "Design": return "bg-cyan-50 text-cyan-600";
    case "Sales": return "bg-purple-50 text-purple-600";
    case "Marketing": return "bg-pink-50 text-pink-600";
    case "HR": return "bg-emerald-50 text-emerald-600";
    case "Finance": return "bg-amber-50 text-amber-600";
    default: return "bg-slate-50 text-slate-600";
  }
};

// Helper: Map attendance to dot style
const getAttendanceDot = (attendance) => {
  switch (attendance) {
    case "On-site": return "bg-emerald-500";
    case "Remote": return "bg-blue-600";
    case "O.O.O": return "bg-amber-500";
    case "Hybrid": return "bg-indigo-500";
    default: return "bg-slate-400";
  }
};

// @desc    Get all employees (with search, filter, sort)
// @route   GET /api/employees
// @access  Public
const getEmployees = async (req, res) => {
  try {
    const { search, dept, attendance, sort } = req.query;

    // Build query
    let query = {};

    // Search filter (name, email, dept, role)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { dept: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
      ];
    }

    // Department filter
    if (dept && dept !== "All Departments") {
      query.dept = dept;
    }

    // Attendance filter
    if (attendance && attendance !== "All Attendance") {
      query.attendance = attendance;
    }

    // Sort config
    let sortConfig = { joinedDate: -1 }; // newest first by default
    if (sort === "oldest") sortConfig = { joinedDate: 1 };

    const employees = await Employee.find(query).sort(sortConfig);

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching employees",
      error: err.message,
    });
  }
};

// @desc    Get single employee by ID
// @route   GET /api/employees/:id
// @access  Public
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }
    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching employee",
      error: err.message,
    });
  }
};

// @desc    Create a new employee
// @route   POST /api/employees
// @access  Public
const createEmployee = async (req, res) => {
  try {
    const { name, email, dept, role, attendance, avatar, performance, joinedDate } = req.body;

    // Auto-generate style fields
    const deptStyle = getDeptStyle(dept);
    const attendanceDot = getAttendanceDot(attendance);

    const employee = await Employee.create({
      name,
      email,
      dept,
      deptStyle,
      role,
      attendance,
      attendanceDot,
      avatar: avatar || "",
      performance: performance || 0,
      perfColor: performance >= 90 ? "bg-emerald-500" : performance >= 75 ? "bg-blue-600" : "bg-slate-400",
      joinedDate: joinedDate || Date.now(),
    });

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employee,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Employee with this email already exists",
      });
    }
    res.status(400).json({
      success: false,
      message: "Failed to create employee",
      error: err.message,
    });
  }
};

// @desc    Update an existing employee
// @route   PUT /api/employees/:id
// @access  Public
const updateEmployee = async (req, res) => {
  try {
    const { dept, attendance, performance } = req.body;

    // Auto-update style fields if dept/attendance changed
    if (dept) req.body.deptStyle = getDeptStyle(dept);
    if (attendance) req.body.attendanceDot = getAttendanceDot(attendance);
    if (performance !== undefined) {
      req.body.perfColor = performance >= 90 ? "bg-emerald-500" : performance >= 75 ? "bg-blue-600" : "bg-slate-400";
    }

    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: employee,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Employee with this email already exists",
      });
    }
    res.status(400).json({
      success: false,
      message: "Failed to update employee",
      error: err.message,
    });
  }
};

// @desc    Delete an employee
// @route   DELETE /api/employees/:id
// @access  Public
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error while deleting employee",
      error: err.message,
    });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};