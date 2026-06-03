export default function BlockLegend({ blockCount, compact = false, showCount = true }) {
  return (
    <div className={`block-legend${compact ? " block-legend--compact" : ""}`} aria-label="Uitleg blokjes">
      <span className="block-legend__item">
        <span className="block-legend__swatch block-legend__swatch--vowel" />
        Wit
      </span>
      <span className="block-legend__item">
        <span className="block-legend__swatch block-legend__swatch--consonant" />
        Blauw
      </span>
      {showCount && blockCount > 0 && (
        <span className="block-legend__count">{blockCount} blokjes</span>
      )}
    </div>
  );
}
