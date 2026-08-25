const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Skill name is required"],
      trim: true,
    },
    level: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    color: {
      type: String,
      default: "bg-slate-400",
    },
  },
  { _id: false }
);

const profileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Full name is required"],
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
    picture: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      default: "Operations Director",
      trim: true,
    },
    department: {
      type: String,
      default: "Enterprise Suite",
      trim: true,
    },
    location: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    company: {
      type: String,
      default: "",
    },
    joined: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    skills: {
      type: [skillSchema],
      default: [],
    },
    languages: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Profile", profileSchema);
