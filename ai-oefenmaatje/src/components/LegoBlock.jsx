export default function LegoBlock({
  letter,
  draggable = true,
  hideLabel = true,
  showOrder,
  selected = false,
  onTap,
}) {
  const className =
    letter.type === "consonant"
      ? "lego-block lego-block--consonant"
      : "lego-block lego-block--vowel";

  const typeLabel =
    letter.type === "consonant" ? "medeklinker" : "klinker";

  const interactive = Boolean(onTap);

  return (
    <div
      className={`${className}${selected ? " lego-block--selected" : ""}${interactive ? " lego-block--tappable" : ""}`}
      draggable={draggable}
      aria-label={typeLabel}
      aria-pressed={interactive ? selected : undefined}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={
        onTap
          ? (event) => {
              event.stopPropagation();
              onTap();
            }
          : undefined
      }
      onKeyDown={
        onTap
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onTap();
              }
            }
          : undefined
      }
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
      {showOrder != null && (
        <span className="lego-block__order" aria-hidden="true">
          {showOrder}
        </span>
      )}
    </div>
  );
}
