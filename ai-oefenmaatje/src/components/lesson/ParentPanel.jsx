import StatusBadge from "../StatusBadge.jsx";

const CHILD_HINTS = {
  "blok-zien":
    "Uw kind ziet het woord en een plaatje. Leg blauw-witte blokjes (geen letters).",
  "patroon-kiezen":
    "Uw kind hoort het woord en kiest een blauw-wit patroon (geen letters).",
  "blok-horen":
    "Uw kind hoort het woord en legt kleurenblokjes zonder letters.",
  "woord-typen":
    "Uw kind typt het woord na de blok-puzzel.",
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
        {inTask && taskType !== "blok-zien" && (
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
