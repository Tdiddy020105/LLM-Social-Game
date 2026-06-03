import BlockLegend from "./BlockLegend.jsx";
import LegoBlock from "./LegoBlock.jsx";
import { puzzleSlotLabel } from "../lib/lessonScript.js";

export default function DragWordGame({
  slots,
  tray,
  onDropSlot,
  onDropTray,
  readOnly = false,
  showLetters = false,
}) {
  const blockCount = slots.length;
  const placedCount = slots.filter(Boolean).length;
  const remainingCount = tray.length;

  function allowDrop(event) {
    if (readOnly) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  return (
    <section
      className={`build-area build-area--puzzle${readOnly ? " build-area--readonly" : ""}`}
      aria-label="Blok-puzzel"
    >
      {!readOnly && <BlockLegend blockCount={blockCount} />}

      <div className="puzzle-target">
        {!readOnly && (
          <p className="puzzle-target__label">{puzzleSlotLabel(blockCount)}</p>
        )}
        <div
          className={`answer-row answer-row--count-${blockCount}`}
          aria-label="Vakjes voor het woord"
        >
          {slots.map((letter, index) => (
            <div
              key={`slot-${index}`}
              className={`answer-slot ${letter ? "answer-slot--filled" : ""}`}
              onDragOver={allowDrop}
              onDrop={
                readOnly
                  ? undefined
                  : (event) => {
                      event.preventDefault();
                      onDropSlot(index, event.dataTransfer.getData("application/letter-id"));
                    }
              }
            >
              {letter ? (
                <LegoBlock
                  letter={letter}
                  draggable={!readOnly}
                  hideLabel={!showLetters}
                  showOrder={showLetters ? undefined : index + 1}
                />
              ) : (
                !readOnly && (
                  <span className="answer-slot__placeholder">{index + 1}</span>
                )
              )}
            </div>
          ))}
        </div>
        {!readOnly && (
          <p className="puzzle-target__hint">
            {placedCount} van {blockCount} vakjes gevuld
          </p>
        )}
      </div>

      {!readOnly && (
        <div className="puzzle-source">
          <p className="puzzle-source__label">
            Blokjes om te verslepen
            {remainingCount > 0 && (
              <span className="puzzle-source__count"> ({remainingCount} over)</span>
            )}
          </p>
          <div
            className="block-tray"
            onDragOver={allowDrop}
            onDrop={(event) => {
              event.preventDefault();
              onDropTray(event.dataTransfer.getData("application/letter-id"));
            }}
          >
            {tray.length === 0 ? (
              <p className="block-tray__empty">Alle blokjes liggen in de vakjes.</p>
            ) : (
              tray.map((letter) => (
                <LegoBlock
                  key={letter.id}
                  letter={letter}
                  draggable
                  hideLabel={!showLetters}
                  showOrder={showLetters ? undefined : letter.vowelOrdinal}
                />
              ))
            )}
          </div>
        </div>
      )}
    </section>
  );
}
