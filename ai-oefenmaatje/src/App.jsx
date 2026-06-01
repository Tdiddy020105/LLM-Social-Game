import { useEffect, useState } from "react";
import "./App.css";
import LessonView from "./components/lesson/LessonView.jsx";
import { useLesson } from "./hooks/useLesson.js";
import { PARENT_LANDING } from "./lib/lessonScript.js";
import { fetchConfig } from "./services/ai.js";
import * as speech from "./services/speech.js";

export default function App() {
  const [screen, setScreen] = useState("intro");
  const [configLoading, setConfigLoading] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(false);

  const lesson = useLesson({ aiEnabled });

  useEffect(() => {
    speech.initVoices();
    async function loadConfig() {
      for (let i = 0; i < 5; i += 1) {
        try {
          const cfg = await fetchConfig();
          if (cfg.ai) {
            setAiEnabled(true);
            return;
          }
        } catch {
          /* retry */
        }
        await new Promise((r) => setTimeout(r, 300));
      }
    }
    loadConfig().finally(() => setConfigLoading(false));
  }, []);

  async function handleStart() {
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
