import BlockLegend from "./BlockLegend.jsx";
import LegoBlock from "./LegoBlock.jsx";

export default function DragWordGame({
  slots,
  tray,
  onDropSlot,
  onDropTray,
}) {
  function allowDrop(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  return (
    <section className="build-area build-area--puzzle">
      <BlockLegend />
      <div className="answer-row">
        {slots.map((letter, index) => (
          <div
            key={`slot-${index}`}
            className={`answer-slot ${letter ? "answer-slot--filled" : ""}`}
            onDragOver={allowDrop}
            onDrop={(event) => {
              event.preventDefault();
              onDropSlot(index, event.dataTransfer.getData("application/letter-id"));
            }}
          >
            {letter ? (
              <LegoBlock letter={letter} draggable />
            ) : (
              <span className="answer-slot__placeholder">{index + 1}</span>
            )}
          </div>
        ))}
      </div>
      <div
        className="block-tray"
        onDragOver={allowDrop}
        onDrop={(event) => {
          event.preventDefault();
          onDropTray(event.dataTransfer.getData("application/letter-id"));
        }}
      >
        {tray.length === 0 ? (
          <p className="block-tray__empty">Alle blokjes liggen op hun plek.</p>
        ) : (
          tray.map((letter) => <LegoBlock key={letter.id} letter={letter} />)
        )}
      </div>
    </section>
  );
}
