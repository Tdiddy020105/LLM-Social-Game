export default function WordHero({
  word,
  hint,
  onReplay,
  highlight = false,
  compact = false,
}) {
  if (!word) return null;

  return (
    <div
      className={`word-hero ${highlight ? "word-hero--highlight" : ""} ${compact ? "word-hero--compact" : ""}`}
      aria-label={`Het woord is ${word}`}
    >
      <p className="word-hero__label">{hint || "Jouw woord"}</p>
      <p className="word-hero__word" lang="nl">
        {word}
      </p>
      {onReplay && (
        <button
          type="button"
          className="btn btn--kid-secondary btn--replay-word"
          onClick={onReplay}
        >
          Woord nog een keer horen
        </button>
      )}
    </div>
  );
}
