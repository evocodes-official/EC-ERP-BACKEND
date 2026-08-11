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
// Scales Routes
// ==========================================
router.route("/sales").get(getScales).post(createScale);
router.route("/sales/:id").get(getScaleById).put(updateScale).delete(deleteScale);

module.exports = router;