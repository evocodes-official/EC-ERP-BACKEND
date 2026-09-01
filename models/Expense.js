const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Expense title is required"],
      trim: true,
    },
    category: {
      type: String,
      default: "OTHER",
      enum: [
        "RENT",
        "SALARIES",
        "UTILITIES",
        "MARKETING",
        "SOFTWARE",
        "TRAVEL",
        "OFFICE_SUPPLIES",
        "TAXES",
        "OTHER",
      ],
    },
    amount: {
      type: Number,
      required: [true, "Expense amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    currency: {
      type: String,
      default: "USD",
      enum: ["USD", "EUR", "GBP", "TRY"],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    vendor: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      default: "BANK_TRANSFER",
      enum: ["CASH", "BANK_TRANSFER", "CREDIT_CARD", "DEBIT_CARD", "CHECK", "OTHER"],
    },
    status: {
      type: String,
      default: "PAID",
      enum: ["PAID", "PENDING"],
    },
    reference: {
      type: String,
      trim: true,
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

module.exports = mongoose.model("Expense", expenseSchema);
