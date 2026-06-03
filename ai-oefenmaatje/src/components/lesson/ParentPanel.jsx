import StatusBadge from "../StatusBadge.jsx";

const CHILD_HINTS = {
  "blok-zien": "Woord + plaatje zichtbaar. Blokjes leggen (wit/blauw).",
  "patroon-kiezen": "Plaatje zichtbaar. Woord horen. Patroon kiezen.",
  "blok-horen": "Plaatje zichtbaar. Woord horen. Blokjes leggen.",
  "woord-typen": "Typ het woord na de blok-puzzel.",
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
    difficulty,
  } = lesson;

  const inTask = step === "task" && currentWord;

  return (
    <aside className="parent-panel parent-panel--compact">
      <h2 className="parent-panel__title">Voor ouder</h2>
      <StatusBadge config={config} />

      {step === "difficulty" && (
        <p className="parent-child-hint">Laat uw kind het niveau kiezen.</p>
      )}

      {inTask && (
        <div className="parent-info parent-info--compact">
          <p className="parent-info__label">{taskMeta?.label}</p>
          {difficulty && <p className="parent-info__level">Niveau: {difficulty}</p>}
          <p className="parent-word">{currentWord.word}</p>
          <p className="parent-child-hint">{CHILD_HINTS[taskType]}</p>
          <p className="parent-phase">Fase: {taskPhase}</p>
          {mistakeCount > 0 && (
            <p className="parent-mistakes">Fouten: {mistakeCount}</p>
          )}
        </div>
      )}

      {caption && inTask && (
        <p className="parent-ai-line__text" title={caption}>
          «{caption.length > 40 ? `${caption.slice(0, 40)}…` : caption}»
        </p>
      )}

      {step === "confidence" && (
        <p className="parent-child-hint">Rustmoment.</p>
      )}

      <div className="parent-actions parent-actions--compact">
        {inTask && isListenTask(taskType) && (
          <button type="button" className="btn btn--parent" onClick={replayWord}>
            Woord laten horen
          </button>
        )}
        <button
          type="button"
          className="btn btn--parent"
          disabled={step !== "task"}
          onClick={() => checkAnswer()}
        >
          Antwoord klopt
        </button>
        <button type="button" className="btn btn--parent" onClick={startConfidenceBreak}>
          Pauze
        </button>
        <button type="button" className="btn btn--ghost btn--compact" onClick={onGoSurvey}>
          Vragenlijst
        </button>
      </div>
    </aside>
  );
}

function isListenTask(taskType) {
  return (
    taskType === "patroon-kiezen" ||
    taskType === "blok-horen" ||
    taskType === "woord-typen"
  );
}
