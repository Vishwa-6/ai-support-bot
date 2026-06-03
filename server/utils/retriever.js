// Calculate cosine similarity between two vectors
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA?.length || !vecB?.length) return 0;

  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  if (magA === 0 || magB === 0) return 0;
  return dotProduct / (magA * magB);
};

// Find top N most relevant chunks for a question
const findRelevantChunks = (questionEmbedding, chunks, topN = 4) => {
  // If no embeddings available, return all chunks as plain text
  const hasEmbeddings = chunks.some(
    (c) => c.embedding && c.embedding.length > 0
  );

  if (!hasEmbeddings) {
    return chunks.slice(0, topN).map((c) => c.text);
  }

  // Score each chunk by similarity
  const scored = chunks.map((chunk) => ({
    text: chunk.text,
    score: cosineSimilarity(questionEmbedding, chunk.embedding),
  }));

  // Sort by score descending, return top N texts
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map((c) => c.text);
};

module.exports = { findRelevantChunks };