import "dotenv/config";
import express from "express";
import cors from "cors";
import { chat } from "./openai.js";
import {
  bootstrapElevenLabs,
  getTtsConfig,
  listElevenLabsVoices,
  synthesizeSpeech,
  testTtsConnection,
} from "./tts.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

function aiEnabled() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    ai: aiEnabled(),
    tts: getTtsConfig(),
  });
});

app.get("/api/config", async (_req, res) => {
  if (getTtsConfig().provider === "elevenlabs") {
    try {
      await bootstrapElevenLabs();
    } catch (error) {
      console.warn("TTS bootstrap on config:", error.message);
    }
  }
  res.json({
    ai: aiEnabled(),
    tts: getTtsConfig(),
  });
});

app.get("/api/voices", async (_req, res) => {
  try {
    const result = await listElevenLabsVoices();
    res.json(result);
  } catch (error) {
    console.error("Voices list error:", error.message);
    res.status(502).json({ error: error.message });
  }
});

app.get("/api/tts/check", async (_req, res) => {
  const config = getTtsConfig();
  if (config.provider === "browser") {
    return res.json({ ok: false, ...config, error: "No TTS API keys in .env" });
  }
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
        error: result.reason || "Browser fallback",
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

app.listen(PORT, async () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`OpenAI: ${aiEnabled() ? "enabled" : "fallback mode"}`);

  try {
    const chosen = await bootstrapElevenLabs();
    if (chosen) {
      console.log(`TTS: elevenlabs — using "${chosen.name}" (${chosen.id})`);
      console.log("All voices: http://localhost:" + PORT + "/api/voices");
    } else {
      console.log(`TTS: ${getTtsConfig().provider}`);
    }
  } catch (error) {
    console.error("ElevenLabs bootstrap failed:", error.message);
    console.log("TTS will fall back to browser until voices API works.");
  }
});
