const mongoose = require("mongoose");

const lineItemSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, "Item description is required"],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Item quantity is required"],
      min: [1, "Quantity must be at least 1"],
      default: 1,
    },
    unitPrice: {
      type: Number,
      required: [true, "Item unit price is required"],
      min: [0, "Unit price cannot be negative"],
    },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: [true, "Invoice number is required"],
      unique: true,
      trim: true,
    },
    client: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
    },
    clientEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Client email must be a valid email address"],
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },
    items: {
      type: [lineItemSchema],
      default: [],
    },
    amount: {
      type: Number,
      min: [0, "Amount cannot be negative"],
      default: 0,
    },
    currency: {
      type: String,
      default: "USD",
      enum: ["USD", "EUR", "GBP", "TRY"],
    },
    status: {
      type: String,
      default: "PENDING",
      enum: ["DRAFT", "PAID", "PENDING", "OVERDUE"],
    },
    amountPaid: {
      type: Number,
      min: [0, "Amount paid cannot be negative"],
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual matching the frontend field name
invoiceSchema.virtual("paid").get(function () {
  return this.status === "PAID";
});

// If no explicit amount was provided but line items exist, compute it
invoiceSchema.pre("validate", function (next) {
  if (this.isModified("items") && this.items.length > 0) {
    this.amount = this.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
  }
  next();
});

module.exports = mongoose.model("Invoice", invoiceSchema);
