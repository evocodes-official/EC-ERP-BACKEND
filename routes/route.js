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

// Import the Profile controller
const { getProfile, updateProfile } = require('../controllers/profileController');

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
// Profile Routes
// ==========================================
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// ==========================================
// Auth Routes
// ==========================================
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', protect, getMe);
router.get('/auth/google/callback', googleCallback);

module.exports = router;