import {
  fetchVoices,
  formatVoicesForClient,
  getCachedVoices,
  pickVoice,
  resolveVoiceId,
} from "./elevenlabs.js";

function env(name) {
  return process.env[name]?.trim() || "";
}

function getProvider() {
  const explicit = env("TTS_PROVIDER").toLowerCase();
  if (explicit === "browser" || explicit === "none") return "browser";

  const hasEleven = Boolean(env("ELEVENLABS_API_KEY"));
  const hasAzure = Boolean(env("AZURE_SPEECH_KEY"));
  const hasGoogle = Boolean(env("GOOGLE_TTS_API_KEY"));

  if (explicit === "elevenlabs" && hasEleven) return "elevenlabs";
  if (explicit === "azure" && hasAzure) return "azure";
  if (explicit === "google" && hasGoogle) return "google";

  if (hasEleven) return "elevenlabs";
  if (hasAzure) return "azure";
  if (hasGoogle) return "google";

  return "browser";
}

export function getTtsConfig() {
  const provider = getProvider();
  const voices = getCachedVoices();
  const active = voices?.find((v) => v.id === process.env.__ACTIVE_VOICE_ID);

  return {
    provider,
    hasExternalTts: provider !== "browser",
    voiceId: active?.id || env("ELEVENLABS_VOICE_ID") || null,
    voiceName: active?.name || null,
  };
}

export async function listElevenLabsVoices() {
  const voices = await fetchVoices();
  const chosen = pickVoice(voices);
  return {
    voices: formatVoicesForClient(voices),
    selected: { id: chosen.id, name: chosen.name, category: chosen.category },
  };
}

export async function bootstrapElevenLabs() {
  if (getProvider() !== "elevenlabs") return null;
  const voiceId = await resolveVoiceId();
  process.env.__ACTIVE_VOICE_ID = voiceId;
  const voices = getCachedVoices();
  return pickVoice(voices);
}

async function elevenLabsTts(text) {
  const apiKey = env("ELEVENLABS_API_KEY");
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY missing");

  const voiceId = await resolveVoiceId();
  process.env.__ACTIVE_VOICE_ID = voiceId;

  const models = [
    env("ELEVENLABS_MODEL") || "eleven_multilingual_v2",
    "eleven_turbo_v2_5",
  ].filter((v, i, a) => a.indexOf(v) === i);

  let lastError = null;

  for (const modelId of models) {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          language_code: "nl",
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.75,
            style: 0.2,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (response.ok) {
      return Buffer.from(await response.arrayBuffer());
    }

    const err = await response.text();
    lastError = `${modelId}: ${response.status} ${err.slice(0, 200)}`;
    console.warn("ElevenLabs attempt failed:", lastError);

    if (response.status === 401 || response.status === 403) {
      break;
    }
  }

  throw new Error(lastError || "ElevenLabs TTS failed");
}

async function azureTts(text) {
  const region = env("AZURE_SPEECH_REGION") || "westeurope";
  const voice = env("AZURE_SPEECH_VOICE") || "nl-NL-FennaNeural";

  const ssml = `<speak version="1.0" xml:lang="nl-NL"><voice name="${voice}">${escapeXml(text)}</voice></speak>`;

  const response = await fetch(
    `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": env("AZURE_SPEECH_KEY"),
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
      },
      body: ssml,
    }
  );

  if (!response.ok) {
    throw new Error(`Azure TTS failed: ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function googleTts(text) {
  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${env("GOOGLE_TTS_API_KEY")}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: "nl-NL",
          name: env("GOOGLE_TTS_VOICE") || "nl-NL-Wavenet-A",
        },
        audioConfig: { audioEncoding: "MP3", speakingRate: 0.92 },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Google TTS failed: ${response.status}`);
  }

  const data = await response.json();
  return Buffer.from(data.audioContent, "base64");
}

function escapeXml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function synthesizeSpeech(text) {
  const provider = getProvider();
  if (provider === "browser") {
    return { provider: "browser", reason: "No TTS API keys in .env" };
  }

  let audio;
  if (provider === "elevenlabs") {
    audio = await elevenLabsTts(text);
  } else if (provider === "azure") {
    audio = await azureTts(text);
  } else if (provider === "google") {
    audio = await googleTts(text);
  }

  return { provider, audio, contentType: "audio/mpeg" };
}

export async function testTtsConnection() {
  const provider = getProvider();
  if (provider === "browser") {
    return { ok: false, provider, error: "No TTS API keys in .env" };
  }
  try {
    const result = await synthesizeSpeech("Hoi.");
    if (!result.audio) {
      return { ok: false, provider, error: result.reason || "No audio" };
    }
    return { ok: true, provider };
  } catch (error) {
    return { ok: false, provider, error: error.message };
  }
}
