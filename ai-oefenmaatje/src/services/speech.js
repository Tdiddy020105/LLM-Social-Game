import { wordTtsText } from "../data/lesson.js";

let speakQueue = Promise.resolve();
let lastQueuedText = "";

const GAP_MS = 180;

export function getLastProviderUsed() {
  return "browser";
}

export function getLastTtsError() {
  return null;
}

/** @deprecated Browser-only TTS; kept for API compatibility */
export function setUseServerTtsOnly() {}

/** @deprecated */
export function setTtsProvider() {}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stopBrowserSpeech() {
  window.speechSynthesis?.cancel();
}

function stopAudio() {
  stopBrowserSpeech();
}

async function speakNow(text) {
  const trimmed = text?.trim();
  if (!trimmed || !window.speechSynthesis) return;

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(trimmed);
    utterance.lang = "nl-NL";
    utterance.rate = 0.88;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
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
