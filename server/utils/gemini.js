const fetch = require("node-fetch");

// Models to try in order - fastest/cheapest first.
const MODELS = [
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
];

const generateAnswer = async (context, question) => {
  const apiKey = process.env.GEMINI_API_KEY;

  const prompt = `You are a helpful customer support assistant for a business.
Answer the customer's question using ONLY the information provided below.
If the answer is not in the information, say "I don't have that information. Please contact us directly."
Keep your answer short, friendly and helpful.

Business Information:
${context}

Customer Question: ${question}

Answer:`;

  // Try each model one by one
  for (const model of MODELS) {
    try {
      console.log(`🤖 Trying model: ${model}`);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 300,
            },
          }),
        }
      );

      // If rate limited → try next model
      if (response.status === 429) {
        console.log(`⚠️ Model ${model} rate limited, trying next...`);
        continue;
      }

      // If other error → try next model
      if (!response.ok) {
        console.log(`❌ Model ${model} failed with ${response.status}`);
        continue;
      }

      const data = await response.json();
      const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (answer) {
        console.log(`Model ${model} responded successfully`);
        return { success: true, answer: answer.trim(), model };
      }

    } catch (err) {
      console.log(`❌ Model ${model} threw error:`, err.message);
      continue;
    }
  }

  // All models failed
  return {
    success: false,
    answer: null,
  };
};

module.exports = { generateAnswer };
