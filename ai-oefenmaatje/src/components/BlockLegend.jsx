export default function BlockLegend() {
  return (
    <div className="block-legend" aria-label="Wit is klinker, rood is medeklinker">
      <span className="block-legend__item">
        <span className="block-legend__swatch block-legend__swatch--vowel" />
        Wit = klinker
      </span>
      <span className="block-legend__item">
        <span className="block-legend__swatch block-legend__swatch--consonant" />
        Rood = medeklinker
      </span>
    </div>
  );
}
