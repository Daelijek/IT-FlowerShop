const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: { type: String, required: true },
  price: { type: String, required: true },
  notes: { type: String, default: null },
  sweets: { type: String, default: null },
  toys: { type: String, default: null },
  total: { type: Number, required: true },
  timestamp: { type: Date, required: true },
});

module.exports = mongoose.model("Order", orderSchema);
