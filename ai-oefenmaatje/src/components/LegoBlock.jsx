export default function LegoBlock({ letter, draggable = true }) {
  const className =
    letter.type === "consonant"
      ? "lego-block lego-block--consonant"
      : "lego-block lego-block--vowel";

  return (
    <div
      className={className}
      draggable={draggable}
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
      <span className="lego-block__label">{letter.text}</span>
    </div>
  );
}
