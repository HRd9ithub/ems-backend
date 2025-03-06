const express = require("express");
const { GoogleGenerativeAI } = require('@google/generative-ai');
const route = express.Router();

// Initialize Google Generative AI with API key from environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Define route to handle POST requests
route.post('/', async (req, res) => {
  const { userInput } = req.body;
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = userInput.toString();
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
  
    // Sending back the generated text as a response
    return res.json({ success:true, message: "", data: text }); // Send JSON response containing the generated text
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal server error.", success: false });
  }
});

module.exports = route
