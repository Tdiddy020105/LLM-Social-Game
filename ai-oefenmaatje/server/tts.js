function env(name) {
  return process.env[name]?.trim() || "";
}

function getProvider() {
  const explicit = env("TTS_PROVIDER").toLowerCase();
  if (explicit === "browser" || explicit === "none" || !explicit) return "browser";

  const hasAzure = Boolean(env("AZURE_SPEECH_KEY"));
  const hasGoogle = Boolean(env("GOOGLE_TTS_API_KEY"));

  if (explicit === "azure" && hasAzure) return "azure";
  if (explicit === "google" && hasGoogle) return "google";

  if (hasAzure) return "azure";
  if (hasGoogle) return "google";

  return "browser";
}

export function getTtsConfig() {
  const provider = getProvider();
  return {
    provider,
    hasExternalTts: provider !== "browser",
    voiceId: null,
    voiceName: provider === "browser" ? "Browser (Nederlands)" : null,
  };
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

async function synthesizeWithProvider(provider, text) {
  if (provider === "azure") return azureTts(text);
  if (provider === "google") return googleTts(text);
  return null;
}

export async function synthesizeSpeech(text) {
  const provider = getProvider();

  if (provider === "browser") {
    return { provider: "browser", reason: "Use browser speech in the app" };
  }

  const audio = await synthesizeWithProvider(provider, text);
  return { provider, audio, contentType: "audio/mpeg" };
}

export async function testTtsConnection() {
  const provider = getProvider();
  if (provider === "browser") {
    return { ok: true, provider, message: "Browser stem in de app" };
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
