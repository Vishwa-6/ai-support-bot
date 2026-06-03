const express = require("express");
const router = express.Router();
const KnowledgeChunk = require("../models/KnowledgeChunk");
const ChatLog = require("../models/ChatLog");
const { getEmbedding } = require("../utils/embeddings");
const { findRelevantChunks } = require("../utils/retriever");
const { generateAnswer } = require("../utils/gemini");
const auth = require("../middleware/auth");

const chatAttempts = new Map();
const CHAT_WINDOW_MS = 60 * 1000;
const CHAT_LIMIT = 12;

const chatRateLimit = (req, res, next) => {
  const key = `${req.ip}:${req.params.businessId}`;
  const now = Date.now();
  const attempts = (chatAttempts.get(key) || []).filter(
    (timestamp) => now - timestamp < CHAT_WINDOW_MS
  );

  if (attempts.length >= CHAT_LIMIT) {
    return res.status(429).json({
      message: "Too many chat requests. Please wait a minute and try again.",
    });
  }

  attempts.push(now);
  chatAttempts.set(key, attempts);
  next();
};

// CHAT ENDPOINT (public - no auth needed)
router.post("/:businessId", chatRateLimit, async (req, res) => {
  try {
    const { question, customerName } = req.body;
    const { businessId } = req.params;

    if (!question || question.trim().length < 2) {
      return res.status(400).json({ message: "Please enter a question" });
    }

    // Get all chunks for this business
    const chunks = await KnowledgeChunk.find({ businessId });

    if (chunks.length === 0) {
      return res.json({
        answer: "Sorry, this business hasn't set up their information yet. Please contact them directly.",
      });
    }

    // Embed the question
    const questionEmbedding = await getEmbedding(question);

    // Find most relevant chunks
    const relevantChunks = findRelevantChunks(questionEmbedding, chunks, 4);

    // Build context
    const context = relevantChunks.join("\n\n");

    // Try to generate answer with fallback
    const result = await generateAnswer(context, question);

    // All models failed - return friendly message
    if (!result.success) {
      return res.status(503).json({
        answer: null,
        rateLimited: true,
        message: "Our AI assistant is currently busy due to high demand. Please try again in 5 minutes.",
      });
    }

    // Save chat log
    await ChatLog.create({
      businessId,
      question: question.trim(),
      answer: result.answer,
      customerName: customerName || "Anonymous",
    });

    res.json({
      answer: result.answer,
      rateLimited: false,
    });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET CHAT LOGS (owner only)
router.get("/logs/:businessId", auth, async (req, res) => {
  try {
    if (req.business.id !== req.params.businessId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const logs = await ChatLog.find({
      businessId: req.params.businessId,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ logs });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
