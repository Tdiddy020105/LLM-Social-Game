import { wordTtsText } from "../data/lesson.js";

const API_BASE = "/api";

let speakQueue = Promise.resolve();
let lastQueuedText = "";
let currentAudio = null;

let ttsConfig = {
  provider: "browser",
  hasExternalTts: false,
  voiceName: "Browser (Nederlands)",
};

let lastProviderUsed = "browser";
let lastTtsError = null;

const GAP_MS = 180;

const PREFERRED_DUTCH_VOICES = [
  "Google Nederlands",
  "Microsoft Frank Online",
  "Microsoft Frank",
  "nl-NL-Wavenet",
  "Xander",
  "Femke",
];

export function configureSpeech(config) {
  if (config?.tts) {
    ttsConfig = { ...ttsConfig, ...config.tts };
  }
}

export function getSpeechConfig() {
  return { ...ttsConfig };
}

let audioUnlocked = false;

/** Call from a tap/click so iOS allows cloud MP3 playback later. */
export function unlockAudioPlayback() {
  if (audioUnlocked || typeof window === "undefined") return Promise.resolve();

  audioUnlocked = true;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return Promise.resolve();

  try {
    const ctx = new AudioCtx();
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    if (ctx.state === "suspended") {
      return ctx.resume().catch(() => {});
    }
  } catch {
    /* ignore */
  }
  return Promise.resolve();
}

export function getLastProviderUsed() {
  return lastProviderUsed;
}

export function getLastTtsError() {
  return lastTtsError;
}

/** @deprecated Use configureSpeech from fetchConfig */
export function setUseServerTtsOnly() {}

/** @deprecated Use configureSpeech */
export function setTtsProvider() {}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stopBrowserSpeech() {
  window.speechSynthesis?.cancel();
}

function stopServerAudio() {
  if (!currentAudio) return;
  currentAudio.pause();
  currentAudio.src = "";
  currentAudio = null;
}

function stopAudio() {
  stopServerAudio();
  stopBrowserSpeech();
}

function pickDutchVoice() {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  if (!voices.length) return null;

  for (const hint of PREFERRED_DUTCH_VOICES) {
    const match = voices.find((voice) => voice.name.includes(hint));
    if (match) return match;
  }

  return (
    voices.find((voice) => voice.lang === "nl-NL") ||
    voices.find((voice) => voice.lang.startsWith("nl"))
  );
}

async function speakBrowser(text) {
  const trimmed = text?.trim();
  if (!trimmed || !window.speechSynthesis) return;

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(trimmed);
    utterance.lang = "nl-NL";
    utterance.rate = 0.88;
    const voice = pickDutchVoice();
    if (voice) utterance.voice = voice;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

async function speakServer(text) {
  const trimmed = text?.trim();
  if (!trimmed) return;

  const response = await fetch(`${API_BASE}/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: trimmed }),
  });

  if (response.status === 503) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.reason || "Server TTS unavailable");
  }

  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    throw new Error(
      detail.error || detail.reason || `TTS request failed (${response.status})`
    );
  }

  const provider = response.headers.get("X-TTS-Provider") || ttsConfig.provider;
  const blob = await response.blob();
  if (!blob.type.startsWith("audio/") && blob.size < 5000) {
    const detail = await blob.text().catch(() => "");
    throw new Error(detail || "TTS returned non-audio response");
  }

  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.playsInline = true;
    audio.setAttribute("playsinline", "");
    audio.setAttribute("webkit-playsinline", "");
    audio.preload = "auto";
    audio.src = url;
    currentAudio = audio;
    audio.onended = () => {
      URL.revokeObjectURL(url);
      if (currentAudio === audio) currentAudio = null;
      resolve(provider);
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      if (currentAudio === audio) currentAudio = null;
      reject(new Error("Audio playback failed"));
    };
    audio.play().catch((error) => {
      URL.revokeObjectURL(url);
      if (currentAudio === audio) currentAudio = null;
      reject(error);
    });
  });
}

async function speakNow(text) {
  const trimmed = text?.trim();
  if (!trimmed) return;

  if (ttsConfig.hasExternalTts) {
    try {
      const provider = await speakServer(trimmed);
      lastProviderUsed = provider || ttsConfig.provider;
      lastTtsError = null;
      return;
    } catch (error) {
      console.warn("[TTS] Server speech failed, using browser:", error);
      lastTtsError = "Cloud-stem niet beschikbaar. Browser-stem wordt gebruikt.";
    }
  }

  lastProviderUsed = "browser";
  await speakBrowser(trimmed);
}

function enqueue(playFn, { interrupt = false, text = "" } = {}) {
  if (interrupt) {
    stopAudio();
    lastQueuedText = "";
    speakQueue = Promise.resolve();
  } else if (text && text === lastQueuedText) {
    return speakQueue;
  }
  if (text) lastQueuedText = text;

  speakQueue = speakQueue
    .then(async () => {
      await playFn();
      await delay(GAP_MS);
    })
    .catch((err) => {
      console.warn("[TTS] queue error:", err);
    });
  return speakQueue;
}

export function speakAndWait(text, { interrupt = false } = {}) {
  return enqueue(() => speakNow(text), { interrupt, text: text?.trim() });
}

export function speakWord(word, { interrupt = false } = {}) {
  if (!word?.trim()) return speakQueue;
  const phrase = wordTtsText(word);
  return speakAndWait(phrase, { interrupt, text: phrase });
}

export function repeatLast(text, { interrupt = true } = {}) {
  if (!text?.trim()) return speakQueue;
  return speakAndWait(text, { interrupt, text: text.trim() });
}

export function interruptSpeech() {
  stopAudio();
  lastQueuedText = "";
  speakQueue = Promise.resolve();
}

export function initVoices() {
  if (!window.speechSynthesis) return;
  const load = () => window.speechSynthesis.getVoices();
  load();
  window.speechSynthesis.onvoiceschanged = load;
}
