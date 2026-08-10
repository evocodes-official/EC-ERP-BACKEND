const express = require("express");
const router = express.Router();
const {
  getScales,
  getScaleById,
  createScale,
  updateScale,
  deleteScale,
} = require("../controllers/scaleController");

router.route("/sales").get(getScales).post(createScale);
router.route("/sales/:id").get(getScaleById).put(updateScale).delete(deleteScale);

module.exports = router;