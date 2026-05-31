export default function VowelGame({ word, options, selected, onSelect, onReplay }) {
  return (
    <section className="build-area vowel-game">
      <p className="build-instruction">Welke klinker hoort in het midden?</p>
      <p className="vowel-word-display">{word}</p>
      {onReplay && (
        <button type="button" className="btn btn--ghost btn--replay" onClick={onReplay}>
          Luister opnieuw
        </button>
      )}
      <div className="vowel-options">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`btn btn--tile ${selected === option ? "btn--tile-active" : ""}`}
            onClick={() => onSelect(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </section>
  );
}
