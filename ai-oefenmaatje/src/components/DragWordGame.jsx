import { useState } from "react";
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
  hideLegend = false,
  compact = false,
  flexiblePlacement = false,
  hideCounts = false,
}) {
  const blockCount = slots.length;
  const placedCount = slots.filter(Boolean).length;
  const remainingCount = tray.length;

  const [selectedId, setSelectedId] = useState(null);

  function orderInSequence(index) {
    if (!slots[index]) return undefined;
    let order = 0;
    for (let i = 0; i <= index; i += 1) {
      if (slots[i]) order += 1;
    }
    return order;
  }

  function slotShowOrder(index) {
    if (showLetters) return undefined;
    if (flexiblePlacement) return orderInSequence(index);
    return index + 1;
  }

  function allowDrop(event) {
    if (readOnly) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function tapTrayLetter(letterId) {
    setSelectedId((prev) => (prev === letterId ? null : letterId));
  }

  function tapSlot(index) {
    if (readOnly) return;
    if (selectedId) {
      onDropSlot(index, selectedId);
      setSelectedId(null);
      return;
    }
    const letter = slots[index];
    if (letter) {
      onDropTray(letter.id);
    }
  }

  function tapSlotBlock(letterId) {
    if (readOnly) return;
    setSelectedId((prev) => (prev === letterId ? null : letterId));
  }

  return (
    <section
      className={`build-area build-area--puzzle${compact ? " build-area--compact" : ""}${readOnly ? " build-area--readonly" : ""}`}
      aria-label="Blok-puzzel"
    >
      {!readOnly && !hideLegend && (
        <BlockLegend blockCount={blockCount} showCount={!hideCounts} />
      )}

      <div className="puzzle-target">
        {!readOnly && (
          <p className="puzzle-target__label">
            {puzzleSlotLabel(blockCount, { flexible: flexiblePlacement, hideCount: hideCounts })}
          </p>
        )}
        <div
          className={`answer-row answer-row--count-${blockCount}`}
          aria-label="Vakjes voor het woord"
        >
          {slots.map((letter, index) => (
            <div
              key={`slot-${index}`}
              className={`answer-slot ${letter ? "answer-slot--filled" : ""}${selectedId && !letter ? " answer-slot--tap-target" : ""}`}
              onDragOver={allowDrop}
              onClick={readOnly ? undefined : () => tapSlot(index)}
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
                  showOrder={slotShowOrder(index)}
                  selected={selectedId === letter.id}
                  onTap={readOnly ? undefined : () => tapSlotBlock(letter.id)}
                />
              ) : (
                !readOnly && (
                  <span className="answer-slot__placeholder">
                    {flexiblePlacement ? "·" : index + 1}
                  </span>
                )
              )}
            </div>
          ))}
        </div>
        {!readOnly && !compact && !hideCounts && (
          <p className="puzzle-target__hint">
            {flexiblePlacement
              ? `${placedCount} blokjes gelegd`
              : `${placedCount} van ${blockCount} vakjes gevuld`}
          </p>
        )}
      </div>

      {!readOnly && (
        <div className="puzzle-source">
          <p className="puzzle-source__label">
            Blokjes
            {!hideCounts && remainingCount > 0 && (
              <span className="puzzle-source__count"> ({remainingCount})</span>
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
                  selected={selectedId === letter.id}
                  onTap={() => tapTrayLetter(letter.id)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </section>
  );
}
