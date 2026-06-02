import { useEffect, useState } from "react";
import "./App.css";
import LessonView from "./components/lesson/LessonView.jsx";
import { useLesson } from "./hooks/useLesson.js";
import { PARENT_LANDING } from "./lib/lessonScript.js";
import { fetchConfig } from "./services/ai.js";
import * as speech from "./services/speech.js";

async function loadAndApplyConfig(setAiEnabled, setVoiceLabel) {
  const cfg = await fetchConfig();
  speech.configureSpeech(cfg);
  if (cfg.ai) setAiEnabled(true);
  const tts = speech.getSpeechConfig();
  setVoiceLabel(
    tts.hasExternalTts
      ? `Cloud-stem: ${tts.voiceName || tts.provider}`
      : "Stem: browser (varieert per apparaat)"
  );
  return cfg;
}

export default function App() {
  const [screen, setScreen] = useState("intro");
  const [configLoading, setConfigLoading] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [voiceLabel, setVoiceLabel] = useState("");

  const lesson = useLesson({ aiEnabled });

  useEffect(() => {
    speech.initVoices();
    async function loadConfig() {
      for (let i = 0; i < 5; i += 1) {
        try {
          await loadAndApplyConfig(setAiEnabled, setVoiceLabel);
          return;
        } catch {
          /* retry */
        }
        await new Promise((r) => setTimeout(r, 300));
      }
    }
    loadConfig().finally(() => setConfigLoading(false));
  }, []);

  async function handleStart() {
    await speech.unlockAudioPlayback();
    await loadAndApplyConfig(setAiEnabled, setVoiceLabel);
    setScreen("lesson");
    await lesson.startLesson();
  }

  if (screen === "intro") {
    return (
      <div className="app app--kid app--landing">
        <main className="child-area child-area--lesson">
          <div className="landing-shell">
            <header className="parent-landing">
              <p className="parent-landing__eyebrow">{PARENT_LANDING.title}</p>
              <h1 className="parent-landing__title">Oefenmaatje</h1>
              <ul className="parent-landing__list">
                {PARENT_LANDING.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </header>
            <button
              type="button"
              className="btn btn--kid-primary btn--large"
              disabled={configLoading}
              onClick={handleStart}
            >
              {configLoading ? "Laden…" : "Start — voor het kind"}
            </button>
            {voiceLabel && !configLoading && (
              <p className="parent-landing__voice">{voiceLabel}</p>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app app--kid app--lesson">
      <main className="child-area child-area--lesson">
        <LessonView
          lesson={lesson}
          onRestart={() => {
            lesson.resetLesson();
            setScreen("intro");
          }}
        />
      </main>
    </div>
  );
}
