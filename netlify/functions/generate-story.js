// netlify/functions/generate-story.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { storyText } = JSON.parse(event.body);
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      throw new Error("Gemini API key is not set.");
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a warm biographer. Take the following raw transcript from a grandparent and transform it into a beautiful, first-person blog post. Clean up grammar, create a smooth narrative, and capture the heartfelt tone. Add a creative, short title. The final output must be a single, clean JSON object with two keys: "title" and "story". Do not wrap the JSON in markdown backticks. Here is the transcript: "${storyText}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: aiText, 
    };
  } catch (error) {
    console.error("Error generating story:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to generate story." }),
    };
  }
};