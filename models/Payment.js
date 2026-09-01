const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
    },
    client: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: [0.01, "Payment amount must be greater than zero"],
    },
    currency: {
      type: String,
      default: "USD",
      enum: ["USD", "EUR", "GBP", "TRY"],
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    method: {
      type: String,
      default: "BANK_TRANSFER",
      enum: ["CASH", "BANK_TRANSFER", "CREDIT_CARD", "PAYPAL", "STRIPE", "OTHER"],
    },
    reference: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      default: "COMPLETED",
      enum: ["COMPLETED", "PENDING", "FAILED", "REFUNDED"],
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

module.exports = mongoose.model("Payment", paymentSchema);
