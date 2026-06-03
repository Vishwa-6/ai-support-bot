const fetch = require("node-fetch");

// Split long text into small chunks
const splitIntoChunks = (text, chunkSize = 300) => {
  const sentences = text.split(/(?<=[.?!])\s+/);
  const chunks = [];
  let current = "";

  for (const sentence of sentences) {
    if ((current + sentence).length > chunkSize) {
      if (current.trim()) chunks.push(current.trim());
      current = sentence;
    } else {
      current += " " + sentence;
    }
  }

  if (current.trim()) chunks.push(current.trim());
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
