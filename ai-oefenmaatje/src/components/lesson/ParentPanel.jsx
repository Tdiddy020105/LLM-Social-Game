import StatusBadge from "../StatusBadge.jsx";
import { getDutchVoices, getPreferredVoiceName, setPreferredVoice } from "../../services/speech.js";

export default function ParentPanel({
  config,
  lesson,
  onGoSurvey,
}) {
  const {
    step,
    taskMeta,
    currentWord,
    taskPhase,
    loading,
    checkAnswer,
    startConfidenceBreak,
    repeat,
    message,
  } = lesson;

  const voices = getDutchVoices();

  return (
    <aside className="parent-panel">
      <p className="eyebrow">Voor ouder</p>
      <h2>Ondersteuning</h2>
      <StatusBadge config={config} />

      {voices.length > 0 && (
        <label className="parent-voice-select">
          Stem (browser reserve)
          <select
            defaultValue={localStorage.getItem("preferredVoiceURI") || ""}
            onChange={(e) => setPreferredVoice(e.target.value)}
          >
            <option value="">Automatisch</option>
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name}
              </option>
            ))}
          </select>
          {getPreferredVoiceName() && (
            <span className="parent-voice-active">{getPreferredVoiceName()}</span>
          )}
        </label>
      )}

      {currentWord && step === "task" && (
        <div className="parent-info">
          <p className="label">Opdracht</p>
          <p className="parent-phase">{taskMeta?.label}</p>
          <p className="label">Woord (alleen voor u)</p>
          <p className="parent-word">{currentWord.word}</p>
          <p className="label">Klinker</p>
          <p className="parent-phase">{currentWord.vowel}</p>
          <p className="label">Fase</p>
          <p className="parent-phase">{taskPhase}</p>
        </div>
      )}

      <div className="parent-actions">
        <button
          type="button"
          className="btn btn--parent"
          disabled={step !== "task" || loading}
          onClick={() => checkAnswer(true)}
        >
          Antwoord klopt
        </button>
        <button
          type="button"
          className="btn btn--parent"
          disabled={step !== "task" || loading}
          onClick={() => checkAnswer(false)}
        >
          Antwoord klopt niet
        </button>
        <button
          type="button"
          className="btn btn--parent"
          disabled={loading}
          onClick={startConfidenceBreak}
        >
          Kind raakt gefrustreerd
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          disabled={!message}
          onClick={repeat}
        >
          Herhaal uitleg
        </button>
        <button type="button" className="btn btn--ghost" onClick={onGoSurvey}>
          Naar vragenlijst
        </button>
      </div>

      <div className="parent-note">
        <h3>AI-lesmodus</h3>
        <p>
          Het kind volgt de stem. U grijpt alleen in bij vastlopen of via de knoppen
          hierboven.
        </p>
      </div>
    </aside>
  );
}
