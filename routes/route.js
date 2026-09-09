const express = require("express");
const router = express.Router();
const config = require("../config/jwt");
const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many authentication attempts, please try again later" },
});

const {
  getSettings,
  updateSettings,
  updatePassword
} = require('../controllers/settingController');

const {
  getScales,
  getScaleById,
  createScale,
  updateScale,
  deleteScale,
} = require("../controllers/scaleController");

const {
  getBoard,
  getDealById,
  createDeal,
  updateDeal,
  deleteDeal
} = require('../controllers/crmController');

const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require('../controllers/hrController');

const {
  getProjects,
  createProject,
  deleteProject,
} = require('../controllers/projectController');

const {
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

const { getDashboardData } = require('../controllers/dashboardController');

const {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} = require('../controllers/invoiceController');
const {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
} = require('../controllers/expenseController');
const {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
} = require('../controllers/paymentController');
const { getFinanceStats } = require('../controllers/financeController');
const { getReports } = require('../controllers/reportController');

const {
  getInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} = require('../controllers/inventoryController');

const { getProfile, updateProfile } = require('../controllers/profileController');

const { uploadImage } = require('../controllers/uploadController');

const {
  register,
  login,
  getMe,
  refreshToken,
  logout,
  googleCallback
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

// ==========================================
// Public Auth Routes (with rate limiting)
// ==========================================
router.post('/auth/register', authLimiter, register);
router.post('/auth/login', authLimiter, login);
router.post('/auth/refresh', authLimiter, refreshToken);
router.get('/auth/google/callback', googleCallback);

// ==========================================
// Protected Auth Routes
// ==========================================
router.get('/auth/me', protect, getMe);
router.post('/auth/logout', protect, logout);

// ==========================================
// Protected Profile Routes
// ==========================================
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// ==========================================
// Board Routes
// ==========================================
router.get('/board', getBoard);

// ==========================================
// Deal Routes
// ==========================================
router.post('/deals', createDeal);
router.get('/deals/:id', getDealById);
router.put('/deals/:id', updateDeal);
router.delete('/deals/:id', deleteDeal);

// ==========================================
// HR Employee Routes
// ==========================================
router.route("/employees")
  .get(getEmployees)
  .post(createEmployee);

router.route("/employees/:id")
  .get(getEmployeeById)
  .put(updateEmployee)
  .delete(deleteEmployee);

// ==========================================
// Scales Routes
// ==========================================
router.route("/sales")
  .get(getScales)
  .post(createScale);

router.route("/sales/:id")
  .get(getScaleById)
  .put(updateScale)
  .delete(deleteScale);

// ==========================================
// Workspace / Project & Task Routes
// ==========================================
router.route("/projects")
  .get(protect, getProjects)
  .post(protect, createProject);

router.delete("/projects/:id", protect, deleteProject);

router.post("/projects/:projectId/tasks", protect, createTask);

router.route("/projects/tasks/:taskId")
  .patch(protect, updateTask)
  .delete(protect, deleteTask);

// ==========================================
// Settings Routes
// ==========================================
router.get('/setting', protect, getSettings);
router.put('/setting', protect, authorize("admin"), updateSettings);
router.post('/password', protect, updatePassword);

// Aliases matching the frontend API paths (SettingsContent.jsx)
router.get('/settings', protect, getSettings);
router.put('/settings', protect, authorize("admin"), updateSettings);
router.post('/settings/password', protect, updatePassword);

// ==========================================
// Dashboard Routes
// ==========================================
router.get('/dashboard', protect, getDashboardData);

// ==========================================
// Finance Routes
// ==========================================
if (getFinanceStats) router.get('/finance/stats', protect, getFinanceStats);

// ==========================================
// Reports Routes
// ==========================================
router.get('/reports', protect, getReports);

router.route("/invoices")
  .get(getInvoices)
  .post(createInvoice);

router.route("/invoices/:id")
  .get(getInvoiceById)
  .put(updateInvoice)
  .delete(deleteInvoice);

router.route("/expenses")
  .get(getExpenses)
  .post(createExpense);

router.route("/expenses/:id")
  .get(getExpenseById)
  .put(updateExpense)
  .delete(deleteExpense);

router.route("/payments")
  .get(getPayments)
  .post(createPayment);

router.route("/payments/:id")
  .get(getPaymentById)
  .put(updatePayment)
  .delete(deletePayment);

// ==========================================
// Inventory Routes
// ==========================================
router.route("/inventory")
  .get(getInventoryItems)
  .post(createInventoryItem);

router.route("/inventory/:id")
  .get(getInventoryItemById)
  .put(updateInventoryItem)
  .delete(deleteInventoryItem);

// ==========================================
// Upload Routes
// ==========================================
router.post('/upload', protect, uploadImage);
router.post('/upload/public', uploadImage);

module.exports = router;