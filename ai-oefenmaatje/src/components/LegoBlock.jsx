export default function LegoBlock({ letter, draggable = true, hideLabel = true }) {
  const className =
    letter.type === "consonant"
      ? "lego-block lego-block--consonant"
      : "lego-block lego-block--vowel";

  const typeLabel =
    letter.type === "consonant" ? "medeklinker" : "klinker";

  return (
    <div
      className={className}
      draggable={draggable}
      aria-label={typeLabel}
      onDragStart={
        draggable
          ? (event) => {
              event.dataTransfer.setData("application/letter-id", letter.id);
              event.dataTransfer.effectAllowed = "move";
            }
          : undefined
      }
    >
      <span className="lego-block__studs" aria-hidden="true" />
      {!hideLabel && letter.text ? (
        <span className="lego-block__label">{letter.text}</span>
      ) : (
        <span className="lego-block__hint" aria-hidden="true" />
      )}
    </div>
  );
}
