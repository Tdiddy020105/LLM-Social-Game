let currentAudio = null;
let speakQueue = Promise.resolve();
let lastProviderUsed = "browser";
let lastTtsError = null;

export function getLastProviderUsed() {
  return lastProviderUsed;
}

export function getLastTtsError() {
  return lastTtsError;
}

export function setTtsProvider(_provider) {
  // Config hint only; speak() always tries the server first.
}

export function getDutchVoices() {
  if (!window.speechSynthesis) return [];
  return window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang.toLowerCase().startsWith("nl"));
}

export function setPreferredVoice(voiceURI) {
  if (voiceURI) localStorage.setItem("preferredVoiceURI", voiceURI);
  else localStorage.removeItem("preferredVoiceURI");
}

export function getPreferredVoiceName() {
  const uri = localStorage.getItem("preferredVoiceURI");
  if (!uri) return null;
  return getDutchVoices().find((v) => v.voiceURI === uri)?.name || null;
}

function pickBrowserVoice() {
  const voices = window.speechSynthesis?.getVoices() || [];
  const preferred = localStorage.getItem("preferredVoiceURI");
  if (preferred) {
    const hit = voices.find((v) => v.voiceURI === preferred);
    if (hit) return hit;
  }
  return (
    voices.find((v) => v.lang.startsWith("nl")) ||
    voices.find((v) => v.lang.includes("NL"))
  );
}

function speakBrowser(text) {
  return new Promise((resolve) => {
    lastProviderUsed = "browser";
    if (!window.speechSynthesis) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "nl-NL";
    utterance.rate = 0.88;
    utterance.pitch = 1;
    const dutch = pickBrowserVoice();
    if (dutch) utterance.voice = dutch;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

function stopAudio() {
  if (currentAudio) {
    currentAudio.pause();
    if (currentAudio.src?.startsWith("blob:")) {
      URL.revokeObjectURL(currentAudio.src);
    }
    currentAudio = null;
  }
  window.speechSynthesis?.cancel();
}

function playBlob(blob, provider) {
  const url = URL.createObjectURL(blob);
  return new Promise((resolve) => {
    currentAudio = new Audio(url);
    currentAudio.onended = () => {
      URL.revokeObjectURL(url);
      currentAudio = null;
      resolve(true);
    };
    currentAudio.onerror = () => {
      URL.revokeObjectURL(url);
      currentAudio = null;
      resolve(false);
    };
    currentAudio
      .play()
      .then(() => {
        lastProviderUsed = provider;
        lastTtsError = null;
      })
      .catch(() => resolve(false));
  });
}

async function tryServerTts(text) {
  try {
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const provider =
      response.headers.get("X-TTS-Provider") || "elevenlabs";
    const contentType = response.headers.get("Content-Type") || "";

    if (!response.ok) {
      let errMsg = `HTTP ${response.status}`;
      try {
        const data = await response.json();
        errMsg = data.error || errMsg;
      } catch {
        /* ignore */
      }
      lastTtsError = errMsg;
      console.warn("[TTS] Server error:", errMsg);
      return false;
    }

    if (contentType.includes("application/json")) {
      const data = await response.json();
      lastTtsError = data.error || "Server returned browser fallback";
      console.warn("[TTS]", lastTtsError);
      return false;
    }

    const blob = await response.blob();
    if (!blob.size) {
      lastTtsError = "Empty audio response";
      return false;
    }

    const played = await playBlob(blob, provider);
    if (!played) {
      lastTtsError = "Audio playback blocked or failed";
      return false;
    }
    return true;
  } catch (error) {
    lastTtsError =
      "API niet bereikbaar. Draait `npm run dev` (frontend + server)?";
    console.warn("[TTS]", lastTtsError, error);
    return false;
  }
}

async function speakNow(text) {
  if (!text?.trim()) return;
  stopAudio();

  const usedServer = await tryServerTts(text);
  if (usedServer) return;

  await speakBrowser(text);
}

export function speak(text) {
  speakQueue = speakQueue.then(() => speakNow(text));
  return speakQueue;
}

export function repeat(text) {
  return speak(text);
}

export function initVoices() {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}
