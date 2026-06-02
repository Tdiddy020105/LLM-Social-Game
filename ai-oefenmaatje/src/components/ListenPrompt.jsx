export default function ListenPrompt({ onReplay, compact = false }) {
  return (
    <div
      className={`listen-prompt${compact ? " listen-prompt--compact" : ""}`}
      aria-label="Luister naar het woord"
    >
      <p className="listen-prompt__text">
        Luister goed. Het woord staat niet op je scherm.
      </p>
      {!compact && (
        <button type="button" className="btn btn--kid-secondary" onClick={onReplay}>
          Woord nog een keer horen
        </button>
      )}
    </div>
  );
}
