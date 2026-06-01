export default function VowelGame({ options, selected, onSelect }) {
  return (
    <section className="build-area vowel-game" aria-label="Kies de klinker">
      <div className="vowel-options">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`btn btn--tile ${selected === option ? "btn--tile-active" : ""}`}
            onClick={() => onSelect(option)}
            aria-label={`Klinker ${option}`}
          >
            {option}
          </button>
        ))}
      </div>
    </section>
  );
}
