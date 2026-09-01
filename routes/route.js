const express = require("express");
const router = express.Router();

const {
  getSettings,
  updateSettings,
  updatePassword
} = require('../controllers/settingController');

// Import your existing scales controller
const {
  getScales,
  getScaleById,
  createScale,
  updateScale,
  deleteScale,
} = require("../controllers/scaleController");

// Import the new CRM controllers
const {
  getBoard,
  getDealById,
  createDeal,
  updateDeal,
  deleteDeal
} = require('../controllers/crmController');

// Import the HR controllers
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require('../controllers/hrController');

// Import the Dashboard controller
const { getDashboardData } = require('../controllers/dashboardController');

// Import the Finance controllers (Invoices, Expenses, Payments, Stats)
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


// Import the Profile controller
const { getProfile, updateProfile } = require('../controllers/profileController');

// Import the Upload controller
const { uploadImage } = require('../controllers/uploadController');

// Import the Auth controller
const { register, login, getMe, googleCallback } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Import the Project & Task controllers
const {
  getProjects,
  createProject,
  deleteProject,
} = require('../controllers/projectController');
const {
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

// ==========================================
// Board Routes
// ==========================================
if (getBoard) router.get('/board', getBoard);

// ==========================================
// Deal Routes
// ==========================================
if (createDeal) router.post('/deals', createDeal);
if (getDealById) router.get('/deals/:id', getDealById);
if (updateDeal) router.put('/deals/:id', updateDeal);
if (deleteDeal) router.delete('/deals/:id', deleteDeal);

// ==========================================
// HR Employee Routes
// ==========================================
if (getEmployees || createEmployee) {
  const empRoute = router.route("/employees");
  if (getEmployees) empRoute.get(getEmployees);
  if (createEmployee) empRoute.post(createEmployee);
}
if (getEmployeeById || updateEmployee || deleteEmployee) {
  const empIdRoute = router.route("/employees/:id");
  if (getEmployeeById) empIdRoute.get(getEmployeeById);
  if (updateEmployee) empIdRoute.put(updateEmployee);
  if (deleteEmployee) empIdRoute.delete(deleteEmployee);
}

// ==========================================
// Scales Routes
// ==========================================
if (getScales || createScale) {
  const salesRoute = router.route("/sales");
  if (getScales) salesRoute.get(getScales);
  if (createScale) salesRoute.post(createScale);
}
if (getScaleById || updateScale || deleteScale) {
  const salesIdRoute = router.route("/sales/:id");
  if (getScaleById) salesIdRoute.get(getScaleById);
  if (updateScale) salesIdRoute.put(updateScale);
  if (deleteScale) salesIdRoute.delete(deleteScale);
}

// ==========================================
// Workspace / Project & Task Routes
// ==========================================
if (getProjects || createProject) {
  const projRoute = router.route("/projects");
  if (getProjects) projRoute.get(getProjects);
  if (createProject) projRoute.post(createProject);
}

if (deleteProject) {
  router.delete("/projects/:id", deleteProject);
}

router.post("/projects/:projectId/tasks", createTask);

const taskRoute = router.route("/projects/tasks/:taskId");
if (updateTask) taskRoute.patch(updateTask);
if (deleteTask) taskRoute.delete(deleteTask);

router.get('/setting', getSettings);
router.put('/setting', updateSettings);
router.post('/password', updatePassword);
// ==========================================
// Dashboard Routes
// ==========================================
router.get('/dashboard', getDashboardData);

// ==========================================
// Finance Routes
// ==========================================

// Finance overview stats (revenue, expenses, net profit, taxes)
if (getFinanceStats) router.get('/finance/stats', getFinanceStats);

// Invoice Routes
if (getInvoices || createInvoice) {
  const invoiceRoute = router.route("/invoices");
  if (getInvoices) invoiceRoute.get(getInvoices);
  if (createInvoice) invoiceRoute.post(createInvoice);
}
if (getInvoiceById || updateInvoice || deleteInvoice) {
  const invoiceIdRoute = router.route("/invoices/:id");
  if (getInvoiceById) invoiceIdRoute.get(getInvoiceById);
  if (updateInvoice) invoiceIdRoute.put(updateInvoice);
  if (deleteInvoice) invoiceIdRoute.delete(deleteInvoice);
}

// Expense Routes
if (getExpenses || createExpense) {
  const expenseRoute = router.route("/expenses");
  if (getExpenses) expenseRoute.get(getExpenses);
  if (createExpense) expenseRoute.post(createExpense);
}
if (getExpenseById || updateExpense || deleteExpense) {
  const expenseIdRoute = router.route("/expenses/:id");
  if (getExpenseById) expenseIdRoute.get(getExpenseById);
  if (updateExpense) expenseIdRoute.put(updateExpense);
  if (deleteExpense) expenseIdRoute.delete(deleteExpense);
}

// Payment Routes
if (getPayments || createPayment) {
  const paymentRoute = router.route("/payments");
  if (getPayments) paymentRoute.get(getPayments);
  if (createPayment) paymentRoute.post(createPayment);
}
if (getPaymentById || updatePayment || deletePayment) {
  const paymentIdRoute = router.route("/payments/:id");
  if (getPaymentById) paymentIdRoute.get(getPaymentById);
  if (updatePayment) paymentIdRoute.put(updatePayment);
  if (deletePayment) paymentIdRoute.delete(deletePayment);
}


// ==========================================
// Profile Routes
// ==========================================
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// ==========================================
// Upload Routes
// ==========================================
router.post('/upload', uploadImage);
router.post('/upload/public', uploadImage);

// ==========================================
// Auth Routes
// ==========================================
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', protect, getMe);
router.get('/auth/google/callback', googleCallback);

module.exports = router;