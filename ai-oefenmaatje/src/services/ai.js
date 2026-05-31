import { getFallback } from "../lib/fallbacks.js";

const API_BASE = "/api";

export async function askCompanion(context) {
  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ context }),
    });

    if (!response.ok) throw new Error("Chat request failed");

    const data = await response.json();
    return {
      text: data.text,
      source: data.source || "api",
    };
  } catch {
    return {
      text: getFallback(context),
      source: "fallback",
    };
  }
}

export async function fetchConfig() {
  try {
    const response = await fetch(`${API_BASE}/config`);
    if (!response.ok) return { ai: false, tts: { provider: "browser" } };
    return response.json();
  } catch {
    return { ai: false, tts: { provider: "browser" } };
  }
}
