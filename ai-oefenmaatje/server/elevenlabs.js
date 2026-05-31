function env(name) {
  return process.env[name]?.trim() || "";
}

let cachedVoices = null;
let resolvedVoiceId = null;

export async function fetchVoices() {
  const apiKey = env("ELEVENLABS_API_KEY");
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY missing");
  }

  const response = await fetch("https://api.elevenlabs.io/v1/voices", {
    headers: { "xi-api-key": apiKey },
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Voices list failed: ${response.status} ${err.slice(0, 120)}`);
  }

  const data = await response.json();
  cachedVoices = (data.voices || []).map((v) => ({
    id: v.voice_id,
    name: v.name,
    category: v.category || "unknown",
    labels: v.labels || {},
    previewUrl: v.preview_url,
  }));

  return cachedVoices;
}

/** Prefer premade (included on free tier), then configured id if present */
export function pickVoice(voices) {
  if (!voices?.length) {
    throw new Error("No voices on this ElevenLabs account");
  }

  const configured = env("ELEVENLABS_VOICE_ID");
  if (configured) {
    const match = voices.find((v) => v.id === configured);
    if (match) return match;
    console.warn(
      `ELEVENLABS_VOICE_ID ${configured} not in your account — picking an available voice.`
    );
  }

  const premade = voices.filter((v) => v.category === "premade");
  const pool = premade.length ? premade : voices;

  const dutchFriendly = pool.find((v) => {
    const lang = `${v.labels?.language || ""} ${v.labels?.accent || ""}`.toLowerCase();
    return lang.includes("dutch") || lang.includes("nederlands");
  });
  if (dutchFriendly) return dutchFriendly;

  const multilingual = pool.find((v) => {
    const desc = JSON.stringify(v.labels || {}).toLowerCase();
    return desc.includes("multilingual") || desc.includes("neutral");
  });
  if (multilingual) return multilingual;

  const preferredNames = ["rachel", "sarah", "lily", "charlotte", "matilda", "josh", "adam"];
  for (const name of preferredNames) {
    const hit = pool.find((v) => v.name.toLowerCase() === name);
    if (hit) return hit;
  }

  return pool[0];
}

export async function resolveVoiceId() {
  if (resolvedVoiceId) return resolvedVoiceId;

  const voices = cachedVoices || (await fetchVoices());
  const chosen = pickVoice(voices);
  resolvedVoiceId = chosen.id;

  console.log(
    `ElevenLabs voice: "${chosen.name}" (${chosen.id}) [${chosen.category}]`
  );

  return resolvedVoiceId;
}

export function getCachedVoices() {
  return cachedVoices;
}

export function formatVoicesForClient(voices) {
  return voices.map((v) => ({
    id: v.id,
    name: v.name,
    category: v.category,
    labels: v.labels,
  }));
}
