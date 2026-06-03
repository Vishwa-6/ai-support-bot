const mongoose = require("mongoose");

const knowledgeChunkSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number], // array of numbers from Gemini
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("KnowledgeChunk", knowledgeChunkSchema);