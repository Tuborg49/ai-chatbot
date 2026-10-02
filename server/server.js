const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const app = express();

// ========================================
// MIDDLEWARE
// ========================================

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ========================================
// GEMINI CLIENT
// ========================================

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ========================================
// TEST ROUTE
// ========================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Tuborg AI server is running",
  });
});

// ========================================
// TEXT CHAT
// ========================================

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    console.log("User message:", message);

    // Check message
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    // Check API key
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is missing");

      return res.status(500).json({
        error: "Gemini API key is not configured",
      });
    }

    // Send request to Gemini
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",

      contents: message.trim(),

      config: {
        systemInstruction: `
You are Tuborg AI, a helpful AI assistant.

Give answers in a clear, natural and easy-to-read format.

Rules:

1. Start with a clear heading when appropriate.
2. Explain the meaning or definition first.
3. Use bullet points for important information.
4. Use numbered steps for procedures.
5. Use short paragraphs.
6. Give simple examples when useful.
7. Use "In simple words" for difficult concepts.
8. Use emojis sparingly.
9. For programming questions, provide useful code examples.
10. For comparison questions, use a table when useful.
11. Do not make every answer unnecessarily long.
12. Match the answer length to the user's question.
13. Do not say that you are ChatGPT unless specifically asked.
14. Do not invent facts.
15. If you are unsure, clearly say so.
16. Make answers easy to read in a chat interface.
        `,
      },
    });

    console.log("Gemini response received");

    // Get text
    const reply = response.text;

    if (!reply) {
      throw new Error("Gemini returned an empty response.");
    }

    // Send response to frontend
    res.json({
      success: true,
      reply: reply,
    });

  } catch (error) {
    console.error("==============================");
    console.error("GEMINI CHAT ERROR");
    console.error("==============================");
    console.error("Message:", error.message);
    console.error("Status:", error.status);
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message || "Gemini request failed",
    });
  }
});

// ========================================
// IMAGE GENERATION
// ========================================

app.post("/api/image", async (req, res) => {
  try {
    const { prompt } = req.body;

    console.log("Image prompt:", prompt);

    // Check prompt
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        error: "Image prompt is required",
      });
    }

    // Check API key
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is missing");

      return res.status(500).json({
        error: "Gemini API key is not configured",
      });
    }

    console.log("Sending image request to Gemini...");

    // Gemini image generation
    const interaction = await ai.interactions.create({
      model: "gemini-3.1-flash-image",
      input: prompt.trim(),

      response_format: {
        type: "image",
        mime_type: "image/png",
        aspect_ratio: "1:1",
        image_size: "1K",
      },
    });

    const generatedImage = interaction.output_image;

    // Check image
    if (!generatedImage || !generatedImage.data) {
      throw new Error("Gemini did not return image data.");
    }

    console.log("Image generated successfully");

    // Send Base64 image to frontend
    res.json({
      success: true,
      image: generatedImage.data,
    });

  } catch (error) {
    console.error("==============================");
    console.error("GEMINI IMAGE ERROR");
    console.error("==============================");
    console.error("Message:", error.message);
    console.error("Status:", error.status);
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message || "Image generation failed",
    });
  }
});

// ========================================
// 404 ROUTE
// ========================================

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
  });
});

// ========================================
// ERROR HANDLER
// ========================================

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(500).json({
    error: "Internal server error",
  });
});

// ========================================
// START SERVER
// ========================================

// Vercel provides PORT automatically.
// Local development uses port 5000.

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Tuborg AI server running on port ${PORT}`);
});