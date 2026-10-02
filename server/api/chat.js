const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

module.exports = async (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { message } = req.body || {};

    console.log("User message:", message);

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",

      contents: message,

      config: {
        systemInstruction: `
You are Tuborg AI, a helpful AI assistant.

Give answers in a clear, natural format.

Follow these rules:

1. Start with a clear heading when appropriate.
2. Explain the meaning or definition first.
3. Use bullet points for important information.
4. Use numbered steps when explaining a procedure.
5. Use short paragraphs instead of large blocks of text.
6. Give simple examples when useful.
7. Use "In simple words" for difficult concepts.
8. Use emojis sparingly when they improve readability.
9. For technical questions, include examples and code when appropriate.
10. For comparison questions, use a table when useful.
11. Do not make every answer unnecessarily long.
12. Match the level of detail to the user's question.
13. Never say that you are ChatGPT unless specifically asked.
14. Do not invent facts.

Make the answer easy to read on a chat interface.
        `,
      },
    });

    return res.status(200).json({
      reply: response.text,
    });

  } catch (error) {
    console.error("GEMINI ERROR:", error);

    return res.status(500).json({
      error: error.message || "Gemini request failed",
    });
  }
};