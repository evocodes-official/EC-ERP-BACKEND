const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Employee name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    avatar: {
      type: String,
      default: "",
    },
    dept: {
      type: String,
      required: [true, "Department is required"],
      enum: ["Engineering", "Design", "Sales", "Marketing", "HR", "Finance"],
      default: "Engineering",
    },
    deptStyle: {
      type: String,
      default: "bg-blue-50 text-blue-600",
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      trim: true,
    },
    attendance: {
      type: String,
      enum: ["On-site", "Remote", "O.O.O", "Hybrid"],
      default: "On-site",
    },
    attendanceDot: {
      type: String,
      default: "bg-emerald-500",
    },
    performance: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    perfColor: {
      type: String,
      default: "bg-slate-400",
    },
    joinedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Employee", employeeSchema);