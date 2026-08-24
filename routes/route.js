const express = require("express");
const router = express.Router();

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
router.route("/employees").get(getEmployees).post(createEmployee);
router.route("/employees/:id").get(getEmployeeById).put(updateEmployee).delete(deleteEmployee);

// ==========================================
// Scales Routes
// ==========================================
router.route("/sales").get(getScales).post(createScale);
router.route("/sales/:id").get(getScaleById).put(updateScale).delete(deleteScale);

// ==========================================
// Dashboard Routes
// ==========================================
router.get('/dashboard', getDashboardData);

module.exports = router;