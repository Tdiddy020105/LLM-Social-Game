function PatternRow({ pattern, small = false }) {
  return (
    <div
      className={`pattern-row${small ? " pattern-row--small" : ""}`}
      aria-hidden="true"
    >
      {pattern.map((type, index) => (
        <span
          key={`${type}-${index}`}
          className={`pattern-row__block pattern-row__block--${type}`}
        />
      ))}
    </div>
  );
}

export default function PatternGame({ options, selectedId, onSelect, disabled = false }) {
  return (
    <section className="build-area pattern-game" aria-label="Kies het patroon">
      <div className="pattern-options">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`pattern-option ${selectedId === option.id ? "pattern-option--active" : ""}`}
            disabled={disabled}
            onClick={() => onSelect(option.id, option.pattern)}
            aria-label="Patroon optie"
            aria-pressed={selectedId === option.id}
          >
            <PatternRow pattern={option.pattern} />
          </button>
        ))}
      </div>
    </section>
  );
}

export { PatternRow };
