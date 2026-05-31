import { useEffect, useState } from "react";
import "./App.css";
import LessonView from "./components/lesson/LessonView.jsx";
import ParentPanel from "./components/lesson/ParentPanel.jsx";
import StatusBadge from "./components/StatusBadge.jsx";
import { SURVEY_QUESTIONS } from "./data/lesson.js";
import { useLesson } from "./hooks/useLesson.js";
import { fetchConfig } from "./services/ai.js";
import * as speech from "./services/speech.js";

export default function App() {
  const [screen, setScreen] = useState("intro");
  const [config, setConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [surveyRatings, setSurveyRatings] = useState(
    Object.fromEntries(SURVEY_QUESTIONS.map((q) => [q, 0]))
  );
  const [surveyOpen, setSurveyOpen] = useState({ good: "", better: "" });
  const [surveySubmitted, setSurveySubmitted] = useState(false);

  const lesson = useLesson();

  useEffect(() => {
    speech.initVoices();
    async function loadConfig() {
      for (let i = 0; i < 5; i += 1) {
        try {
          const cfg = await fetchConfig();
          setConfig(cfg);
          if (cfg.tts?.hasExternalTts) return;
        } catch {
          /* retry */
        }
        await new Promise((r) => setTimeout(r, 400));
      }
    }
    loadConfig().finally(() => setConfigLoading(false));
  }, []);

  async function handleStart() {
    setScreen("lesson");
    await lesson.startLesson();
  }

  function handleSurveySubmit(event) {
    event.preventDefault();
    setSurveySubmitted(true);
    console.info("[Oefenmaatje survey]", { ratings: surveyRatings, open: surveyOpen });
  }

  if (screen === "intro") {
    return (
      <div className="app app--intro">
        <div className="intro-card">
          <p className="eyebrow">AI-lesmodus · Prototype</p>
          <h1>Oefenmaatje</h1>
          <StatusBadge config={config} />
          <p className="intro-lead">
            Korte proefles met een AI-oefenmaatje. Uw kind wordt stap voor stap
            begeleid. Dit vervangt geen leraar.
          </p>
          <ul className="intro-list">
            <li>Zit samen bij de computer of tablet.</li>
            <li>Laat uw kind luisteren en zelf kiezen.</li>
            <li>Help alleen als uw kind vastloopt.</li>
            <li>Vul aan het eind de korte vragenlijst in.</li>
          </ul>
          <div className="intro-legend">
            <div className="intro-legend__item">
              <span className="lego-block lego-block--consonant lego-block--small">
                <span className="lego-block__studs" />
              </span>
              <span>Rood = medeklinker</span>
            </div>
            <div className="intro-legend__item">
              <span className="lego-block lego-block--vowel lego-block--small">
                <span className="lego-block__studs" />
              </span>
              <span>Wit = klinker</span>
            </div>
          </div>
          <button
            type="button"
            className="btn btn--primary btn--large"
            disabled={configLoading}
            onClick={handleStart}
          >
            {configLoading ? "Laden…" : "Start de les"}
          </button>
        </div>
      </div>
    );
  }

  if (screen === "survey") {
    return (
      <div className="app app--survey">
        <div className="survey-card">
          <p className="eyebrow">Afsluiting</p>
          <h1>Vragenlijst voor ouder</h1>
          <p className="survey-lead">
            Bedankt. Geef hieronder uw mening (niet opgeslagen op een server).
          </p>
          {surveySubmitted ? (
            <p className="survey-thanks">Bedankt voor uw feedback.</p>
          ) : (
            <form className="survey-form" onSubmit={handleSurveySubmit}>
              {SURVEY_QUESTIONS.map((question) => (
                <fieldset key={question} className="survey-scale">
                  <legend>{question}</legend>
                  <div className="survey-scale__options">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <label key={value} className="survey-scale__label">
                        <input
                          type="radio"
                          name={question}
                          value={value}
                          checked={surveyRatings[question] === value}
                          onChange={() =>
                            setSurveyRatings((prev) => ({
                              ...prev,
                              [question]: value,
                            }))
                          }
                          required
                        />
                        <span>{value}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
              <label className="survey-open">
                Wat werkte goed?
                <textarea
                  value={surveyOpen.good}
                  onChange={(e) =>
                    setSurveyOpen((p) => ({ ...p, good: e.target.value }))
                  }
                  rows={3}
                />
              </label>
              <label className="survey-open">
                Wat kan beter?
                <textarea
                  value={surveyOpen.better}
                  onChange={(e) =>
                    setSurveyOpen((p) => ({ ...p, better: e.target.value }))
                  }
                  rows={3}
                />
              </label>
              <button type="submit" className="btn btn--primary">
                Verstuur feedback
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <main className="child-area child-area--lesson">
        <header className="child-header">
          <div>
            <p className="eyebrow">Les</p>
            <h1>AI-oefenmaatje</h1>
          </div>
        </header>
        <LessonView
          lesson={lesson}
          config={config}
          onEndSurvey={() => setScreen("survey")}
        />
      </main>
      <ParentPanel
        config={config}
        lesson={lesson}
        onGoSurvey={() => setScreen("survey")}
      />
    </div>
  );
}
