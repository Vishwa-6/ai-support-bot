const fetch = require("node-fetch");

// Split long text into small chunks with sentence-aware sliding window overlap
const splitIntoChunks = (text, chunkSize = 300, overlapSize = 50) => {
  if (!text || !text.trim()) return [];
  if (text.length <= chunkSize) {
    return [text.trim()];
  }

  const sentences = text
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks = [];
  let currentChunk = [];
  let currentLength = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];

    if (sentence.length > chunkSize) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.join(" "));
        currentChunk = [];
        currentLength = 0;
      }
      chunks.push(sentence);
      continue;
    }

    const spaceOffset = currentChunk.length > 0 ? 1 : 0;
    if (currentLength + spaceOffset + sentence.length > chunkSize) {
      chunks.push(currentChunk.join(" "));

      const overlapChunk = [];
      let overlapLength = 0;

      for (let j = currentChunk.length - 1; j >= 0; j--) {
        const s = currentChunk[j];
        const space = overlapChunk.length > 0 ? 1 : 0;
        if (overlapLength + space + s.length <= overlapSize) {
          overlapChunk.unshift(s);
          overlapLength += space + s.length;
        } else {
          break;
        }
      }

      currentChunk = [...overlapChunk, sentence];
      currentLength = overlapLength + (overlapChunk.length > 0 ? 1 : 0) + sentence.length;
    } else {
      currentChunk.push(sentence);
      currentLength += spaceOffset + sentence.length;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(" "));
  }

  return chunks;
};

// Get embedding using direct REST API call
const getEmbedding = async (text) => {
  const apiKey = process.env.GEMINI_API_KEY;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-embedding-001:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "models/gemini-embedding-001",
        content: {
          parts: [{ text }],
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error("Embedding API error:", JSON.stringify(error, null, 2));
    throw new Error(`Embedding failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.embedding.values;
};

module.exports = { splitIntoChunks, getEmbedding };
