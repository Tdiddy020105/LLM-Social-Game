import StatusBadge from "../StatusBadge.jsx";

const CHILD_HINTS = {
  "klinker-detective":
    "Uw kind hoort het woord. Op dit scherm staan geen letters — alleen luisteren.",
  "klank-volgorde":
    "Uw kind hoort het woord. Blokjes hebben geen letters — wit klinker, rood medeklinker.",
  "woord-bouwen":
    "Zelfde blokjes: luisteren, tikken voor de klank, dan op volgorde leggen.",
};

export default function ParentPanel({ config, lesson, onGoSurvey }) {
  const {
    step,
    taskType,
    taskMeta,
    currentWord,
    taskPhase,
    mistakeCount,
    caption,
    checkAnswer,
    startConfidenceBreak,
    replayWord,
  } = lesson;

  const inTask = step === "task" && currentWord;

  return (
    <aside className="parent-panel parent-panel--compact">
      <h2 className="parent-panel__title">Voor ouder</h2>
      <StatusBadge config={config} />

      {step === "onboarding" && (
        <p className="parent-child-hint">
          Uw kind doorloopt een korte uitleg. Klik samen op Volgende.
        </p>
      )}

      {step === "difficulty" && (
        <p className="parent-child-hint">Laat uw kind het niveau kiezen.</p>
      )}

      {inTask && (
        <div className="parent-info parent-info--compact">
          <p className="parent-info__label">{taskMeta?.label}</p>
          <p className="parent-word">{currentWord.word}</p>
          {taskType === "klinker-detective" && (
            <>
              <p className="label">Klinker (midden)</p>
              <p className="parent-answer-key">{currentWord.vowel}</p>
            </>
          )}
          <p className="parent-child-hint">{CHILD_HINTS[taskType]}</p>
          <p className="parent-phase">Fase: {taskPhase}</p>
          {mistakeCount > 0 && (
            <p className="parent-mistakes">Pogingen met fout: {mistakeCount}</p>
          )}
        </div>
      )}

      {caption && inTask && (
        <p className="parent-ai-line__text" title={caption}>
          Zegt nu: «{caption.length > 60 ? `${caption.slice(0, 60)}…` : caption}»
        </p>
      )}

      {step === "confidence" && (
        <p className="parent-child-hint">Rustmoment — kind klikt zelf verder.</p>
      )}

      <div className="parent-actions parent-actions--compact">
        {inTask && (
          <button type="button" className="btn btn--parent" onClick={replayWord}>
            Woord laten horen
          </button>
        )}
        <button
          type="button"
          className="btn btn--parent"
          disabled={step !== "task"}
          onClick={() => checkAnswer(true)}
        >
          Antwoord klopt
        </button>
        <button
          type="button"
          className="btn btn--parent"
          disabled={step !== "task"}
          onClick={() => checkAnswer(false)}
        >
          Antwoord klopt niet
        </button>
        <button type="button" className="btn btn--parent" onClick={startConfidenceBreak}>
          Kind heeft pauze nodig
        </button>
        <button type="button" className="btn btn--ghost btn--compact" onClick={onGoSurvey}>
          Vragenlijst
        </button>
      </div>
    </aside>
  );
}
