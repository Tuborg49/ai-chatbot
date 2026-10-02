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
    const { prompt } = req.body || {};

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
      throw new Error("Gemini did not return image data.");
    }

    console.log("Image generated successfully");

    return res.status(200).json({
      image: generatedImage.data,
    });

  } catch (error) {
    console.error("IMAGE GENERATION ERROR:", error);

    return res.status(500).json({
      error: error.message || "Image generation failed",
    });
  }
};