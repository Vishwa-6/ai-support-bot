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
    const { question, customerName, sessionId } = req.body;
    const { businessId } = req.params;

    if (!question || question.trim().length < 2) {
      return res.status(400).json({ message: "Please enter a question" });
    }

    // Get all chunks for this business - optimized with lean and projections
    const chunks = await KnowledgeChunk.find({ businessId })
      .select("text embedding")
      .lean();

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

    const isUnresolved = result.answer.toLowerCase().includes("i don't have that information");

    // Save chat log with sessionId and unresolved status
    await ChatLog.create({
      businessId,
      question: question.trim(),
      answer: result.answer,
      customerName: customerName || "Anonymous",
      sessionId: sessionId || null,
      isUnresolved,
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

    // Auto-purge old logs (older than 30 days)
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await ChatLog.deleteMany({
      businessId: req.params.businessId,
      createdAt: { $lt: cutoff },
    });

    const logs = await ChatLog.find({
      businessId: req.params.businessId,
    })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    res.json({ logs });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET UNRESOLVED CHAT LOGS (owner only)
router.get("/unresolved/:businessId", auth, async (req, res) => {
  try {
    if (req.business.id !== req.params.businessId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const unresolvedLogs = await ChatLog.find({
      businessId: req.params.businessId,
      isUnresolved: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ unresolvedLogs });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// TOGGLE STAR ON A LOG (owner only)
router.put("/logs/:logId/star", auth, async (req, res) => {
  try {
    const log = await ChatLog.findById(req.params.logId);
    if (!log) {
      return res.status(404).json({ message: "Chat log not found" });
    }
    if (log.businessId.toString() !== req.business.id) {
      return res.status(403).json({ message: "Access denied" });
    }
    log.isStarred = !log.isStarred;
    await log.save();
    res.json({ message: "Star toggled successfully", isStarred: log.isStarred });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// MARK LOG AS RESOLVED (owner only)
router.put("/logs/:logId/resolve", auth, async (req, res) => {
  try {
    const log = await ChatLog.findById(req.params.logId);
    if (!log) {
      return res.status(404).json({ message: "Chat log not found" });
    }
    if (log.businessId.toString() !== req.business.id) {
      return res.status(403).json({ message: "Access denied" });
    }
    log.isUnresolved = false;
    await log.save();
    res.json({ message: "Log marked as resolved" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE A SINGLE CHAT LOG (owner only)
router.delete("/logs/:logId", auth, async (req, res) => {
  try {
    const log = await ChatLog.findById(req.params.logId);
    if (!log) {
      return res.status(404).json({ message: "Chat log not found" });
    }
    if (log.businessId.toString() !== req.business.id) {
      return res.status(403).json({ message: "Access denied" });
    }
    await ChatLog.findByIdAndDelete(req.params.logId);
    res.json({ message: "Chat log deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE AN ENTIRE SESSION (owner only)
router.delete("/logs/session/:sessionId", auth, async (req, res) => {
  try {
    const result = await ChatLog.deleteMany({
      businessId: req.business.id,
      sessionId: req.params.sessionId,
    });
    res.json({ message: "Session deleted successfully", deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
