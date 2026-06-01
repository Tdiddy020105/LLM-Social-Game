export default function BuddyOrb({ caption, speaking, onRepeat }) {
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

      {caption && !speaking && onRepeat && (
        <button type="button" className="btn btn--soft btn--repeat" onClick={onRepeat}>
          Nog een keer horen
        </button>
      )}
    </div>
  );
}
