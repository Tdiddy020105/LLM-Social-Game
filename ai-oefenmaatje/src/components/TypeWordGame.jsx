export default function TypeWordGame({
  value,
  onChange,
  disabled = false,
  placeholder = "Typ het woord",
}) {
  return (
    <section className="build-area type-word-game" aria-label="Typ het woord">
      <label className="type-word-game__label" htmlFor="type-word-input">
        Typ het woord
      </label>
      <input
        id="type-word-input"
        type="text"
        className="type-word-game__input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        inputMode="text"
        lang="nl"
      />
    </section>
  );
}
