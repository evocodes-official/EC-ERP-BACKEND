const mongoose = require("mongoose");

const scaleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Scale name is required"],
      trim: true,
    },
    serialNumber: {
      type: String,
      required: [true, "Serial number is required"],
      unique: true,
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
    manufacturer: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    capacity: {
      type: Number,
      min: 0,
    },
    unit: {
      type: String,
      default: "kg",
      enum: ["kg", "g", "lb", "ton"],
    },
    status: {
      type: String,
      default: "active",
      enum: ["active", "inactive", "maintenance", "out_of_service"],
    },
    lastCalibrated: {
      type: Date,
    },
    nextCalibrationDue: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Scale", scaleSchema);