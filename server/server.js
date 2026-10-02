const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json());

// ==========================================
// GEMINI CLIENT
// ==========================================

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ==========================================
// TEST SERVER
// ==========================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Tuborg AI server is running",
  });
});

// ==========================================
// TEXT CHAT
// ==========================================

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

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
You are a helpful AI assistant.

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

    console.log("Gemini response received");

    res.json({
      reply: response.text,
    });

  } catch (error) {
    console.error("GEMINI ERROR:");
    console.error(error);

    res.status(500).json({
      error: error.message || "Gemini request failed",
    });
  }
});

// ==========================================
// IMAGE GENERATION
// ==========================================

app.post("/api/image", async (req, res) => {
  try {
    const { prompt } = req.body;

    console.log("Image prompt:", prompt);

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: "Image prompt is required",
      });
    }

    console.log("Sending image request to Gemini...");

    const interaction = await ai.interactions.create({
      model: "gemini-3.1-flash-image",
      input: prompt.trim(),
    });

    const generatedImage = interaction.output_image;

    if (!generatedImage) {
      throw new Error(
        "Gemini did not return image data."
      );
    }

    console.log("Image generated successfully");

    res.json({
      image: generatedImage.data,
    });

  } catch (error) {
    console.error("IMAGE GENERATION ERROR:");
    console.error(error);

    res.status(500).json({
      error:
        error.message ||
        "Image generation failed",
    });
  }
});

// ==========================================
// LOCAL SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(
      `Tuborg AI server running on port ${PORT}`
    );
  });
}

// ==========================================
// VERCEL
// ==========================================

module.exports = app;