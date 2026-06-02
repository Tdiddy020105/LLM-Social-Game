export default function BuddyOrb({
  caption,
  speaking,
  onRepeat,
  repeatLabel = "Nog een keer horen",
  onRepeatInstruction,
  onRepeatWord,
}) {
  const showActions = caption && !speaking;

  return (
    <div className="buddy-maatje" aria-live="polite">
      <div
        className={`buddy-maatje__face ${speaking ? "buddy-maatje__face--talking" : ""}`}
        aria-hidden="true"
      >
        <span className="buddy-maatje__eyes" />
        <span className="buddy-maatje__smile" />
      </div>

      <p className={`buddy-maatje__caption ${speaking ? "buddy-maatje__caption--live" : ""}`}>
        {caption || (speaking ? "…" : "")}
      </p>

      {showActions && (onRepeatInstruction || onRepeatWord || onRepeat) && (
        <div className="buddy-maatje__actions">
          {onRepeatInstruction && (
            <button
              type="button"
              className="btn btn--soft btn--repeat"
              onClick={onRepeatInstruction}
            >
              Uitleg nog een keer
            </button>
          )}
          {onRepeatWord && (
            <button
              type="button"
              className="btn btn--soft btn--repeat"
              onClick={onRepeatWord}
            >
              Woord nog een keer horen
            </button>
          )}
          {onRepeat && !onRepeatInstruction && !onRepeatWord && (
            <button type="button" className="btn btn--soft btn--repeat" onClick={onRepeat}>
              {repeatLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
