const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const KnowledgeChunk = require("../models/KnowledgeChunk");
const { splitIntoChunks, getEmbedding } = require("../utils/embeddings");

// ─── UPLOAD KNOWLEDGE BASE ───────────────────────────────
router.post("/upload", auth, async (req, res) => {
  try {
    const { text } = req.body;
    const businessId = req.business.id;

    if (!text || text.trim().length < 10) {
      return res.status(400).json({ message: "Please enter more information" });
    }

    if (text.length > 50000) {
      return res.status(400).json({ message: "Text too large (max 50KB)" });
    }

    await KnowledgeChunk.deleteMany({ businessId });

    const chunks = splitIntoChunks(text);

    if (chunks.length === 0) {
      return res.status(400).json({ message: "Could not process the text" });
    }

    const savedChunks = [];
    for (const chunk of chunks) {
      const embedding = await getEmbedding(chunk);
      const saved = await KnowledgeChunk.create({
        businessId,
        text: chunk,
        embedding,
      });
      savedChunks.push(saved);
    }

    res.json({
      message: "Knowledge base updated successfully",
      chunksCount: savedChunks.length,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── GET ALL CHUNKS ───────────────────────────────────────
router.get("/", auth, async (req, res) => {
  try {
    const chunks = await KnowledgeChunk.find({
      businessId: req.business.id,
    }).select("text createdAt");

    res.json({ chunks });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ─── EDIT A SINGLE CHUNK ──────────────────────────────────
router.put("/:chunkId", auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length < 3) {
      return res.status(400).json({ message: "Text too short" });
    }

    // Find chunk and make sure it belongs to this business
    const chunk = await KnowledgeChunk.findOne({
      _id: req.params.chunkId,
      businessId: req.business.id,
    });

    if (!chunk) {
      return res.status(404).json({ message: "Chunk not found" });
    }

    // Regenerate embedding for updated text
    const embedding = await getEmbedding(text.trim());

    chunk.text = text.trim();
    chunk.embedding = embedding;
    await chunk.save();

    res.json({
      message: "Chunk updated successfully",
      chunk: { _id: chunk._id, text: chunk.text },
    });
  } catch (err) {
    console.error("Edit chunk error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── DELETE A SINGLE CHUNK ────────────────────────────────
router.delete("/:chunkId", auth, async (req, res) => {
  try {
    const chunk = await KnowledgeChunk.findOneAndDelete({
      _id: req.params.chunkId,
      businessId: req.business.id,
    });

    if (!chunk) {
      return res.status(404).json({ message: "Chunk not found" });
    }

    res.json({ message: "Chunk deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ─── ADD MORE CHUNKS (without deleting existing) ──────────
router.post("/add-more", auth, async (req, res) => {
  try {
    const { text } = req.body;
    const businessId = req.business.id;

    if (!text || text.trim().length < 10) {
      return res.status(400).json({ message: "Please enter more information" });
    }

    // Get existing chunks to check for duplicates
    const existingChunks = await KnowledgeChunk.find({ businessId }).select("text");
    const existingTexts = existingChunks.map((c) => c.text.toLowerCase().trim());

    // Split new text into chunks
    const chunks = splitIntoChunks(text);

    if (chunks.length === 0) {
      return res.status(400).json({ message: "Could not process the text" });
    }

    // Filter out duplicate chunks
    const newChunks = chunks.filter(
      (chunk) => !existingTexts.includes(chunk.toLowerCase().trim())
    );

    if (newChunks.length === 0) {
      return res.status(400).json({
        message: "All content already exists in your knowledge base",
      });
    }

    // Save only new non-duplicate chunks
    const savedChunks = [];
    for (const chunk of newChunks) {
      const embedding = await getEmbedding(chunk);
      const saved = await KnowledgeChunk.create({
        businessId,
        text: chunk,
        embedding,
      });
      savedChunks.push(saved);
    }

    res.json({
      message: "New content added successfully",
      addedChunks: savedChunks.length,
      skippedDuplicates: chunks.length - newChunks.length,
    });
  } catch (err) {
    console.error("Add more error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;