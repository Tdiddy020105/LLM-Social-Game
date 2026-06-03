export default function BlockLegend({ blockCount }) {
  return (
    <div className="block-legend" aria-label="Uitleg blokjes">
      <span className="block-legend__item">
        <span className="block-legend__swatch block-legend__swatch--vowel" />
        Wit = klinker
      </span>
      <span className="block-legend__item">
        <span className="block-legend__swatch block-legend__swatch--consonant" />
        Blauw = medeklinker
      </span>
      {blockCount > 0 && (
        <span className="block-legend__count">
          {blockCount} {blockCount === 1 ? "blokje" : "blokjes"} nodig
        </span>
      )}
    </div>
  );
}
