import { SYSTEM_PROMPT, buildUserMessage, getFallback } from "./prompts.js";

const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

function getApiKey() {
  return process.env.OPENAI_API_KEY?.trim() || "";
}

export async function chat(context) {
  const apiKey = getApiKey();
  const userMessage = buildUserMessage(context);

  if (!apiKey) {
    return { text: getFallback(context), source: "fallback" };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        max_tokens: 180,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`${response.status} ${errText.slice(0, 150)}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim();

    return {
      text: text || getFallback(context),
      source: "openai",
      model: data.model || DEFAULT_MODEL,
    };
  } catch (error) {
    console.error("OpenAI error:", error.message);
    return {
      text: getFallback(context),
      source: "fallback",
      error: error.message,
    };
  }
}
