const mongoose = require("mongoose");

const chatLogSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      default: "Anonymous",
    },
    sessionId: {
      type: String,
      required: false,
    },
    isStarred: {
      type: Boolean,
      default: false,
    },
    isUnresolved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatLog", chatLogSchema);