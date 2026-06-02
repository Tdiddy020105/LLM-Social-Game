import "dotenv/config";
import express from "express";
import cors from "cors";
import { chat } from "./genai.js";
import { getTtsConfig, synthesizeSpeech, testTtsConnection } from "./tts.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

function aiEnabled() {
  return Boolean(process.env.GOOGLE_GENAI_API_KEY?.trim());
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    ai: aiEnabled(),
    tts: getTtsConfig(),
  });
});

app.get("/api/config", (_req, res) => {
  res.json({
    ai: aiEnabled(),
    tts: getTtsConfig(),
  });
});

app.get("/api/tts/check", async (_req, res) => {
  const config = getTtsConfig();
  const test = await testTtsConnection();
  res.json({ ...config, ...test });
});

app.post("/api/chat", async (req, res) => {
  try {
    const context = req.body?.context || {};
    const result = await chat(context);
    res.json(result);
  } catch (error) {
    console.error("Chat route error:", error);
    res.status(500).json({ error: "Chat failed" });
  }
});

app.post("/api/tts", async (req, res) => {
  try {
    const text = req.body?.text?.trim();
    if (!text) {
      return res.status(400).json({ error: "Missing text" });
    }

    const result = await synthesizeSpeech(text);
    if (result.provider === "browser") {
      return res.status(503).json({
        provider: "browser",
        error: result.reason || "Use browser speech in the app",
      });
    }

    res.setHeader("Content-Type", result.contentType || "audio/mpeg");
    res.setHeader("X-TTS-Provider", result.provider);
    res.send(result.audio);
  } catch (error) {
    console.error("TTS route error:", error.message);
    res.status(502).json({ provider: "browser", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`GenAI: ${aiEnabled() ? "enabled" : "fallback mode"}`);
  console.log(`TTS: ${getTtsConfig().provider} (${getTtsConfig().voiceName})`);
});
