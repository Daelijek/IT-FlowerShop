const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone_number: { type: String, required: true },
  category: { type: String, required: true }, // Например: Cooperation, Service, Complaint, Other
  question: { type: String, required: true },
  policy_agreed: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Feedback", feedbackSchema);
