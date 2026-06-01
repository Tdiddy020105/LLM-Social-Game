import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT, buildUserMessage, getFallback } from "./prompts.js";

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

function getApiKey() {
  return process.env.GOOGLE_GENAI_API_KEY?.trim() || "";
}

export async function chat(context) {
  const apiKey = getApiKey();
  const userMessage = buildUserMessage(context);

  if (!apiKey) {
    return { text: getFallback(context), source: "fallback" };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: DEFAULT_MODEL,
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      generationConfig: { maxOutputTokens: 80, temperature: 0.5 },
    });

    const text = result.response.text()?.trim();

    return {
      text: text || getFallback(context),
      source: "genai",
      model: DEFAULT_MODEL,
    };
  } catch (error) {
    console.error("GenAI error:", error.message);
    return {
      text: getFallback(context),
      source: "fallback",
      error: error.message,
    };
  }
}
