import DragWordGame from "./DragWordGame.jsx";
import LegoBlock from "./LegoBlock.jsx";
import { EASY_WORDS, FAVORITE_BLOCKS } from "../data/words.js";

export default function RecoveryPanel({
  mode,
  favoritePlaced,
  recoveryWord,
  recoverySlots,
  recoveryTray,
  onChoose,
  onFavoriteDrop,
  onEasyWordSelect,
  onRecoveryDropSlot,
  onRecoveryDropTray,
  onEasyPlayDone,
  onFinish,
}) {
  function allowDrop(event) {
    event.preventDefault();
  }

  if (mode === "choose") {
    return (
      <section className="recovery-panel">
        <h2>Even rustig oefenen</h2>
        <p>Kies iets makkelijks om weer vertrouwen te krijgen.</p>
        <div className="recovery-actions">
          <button
            type="button"
            className="btn btn--secondary btn--large"
            onClick={() => onChoose("favorite")}
          >
            Kies je favoriete blok
          </button>
          <button
            type="button"
            className="btn btn--secondary btn--large"
            onClick={() => onChoose("easy")}
          >
            Maak een makkelijk woord
          </button>
        </div>
      </section>
    );
  }

  if (mode === "favorite") {
    return (
      <section className="recovery-panel">
        <h2>Favoriete blok</h2>
        <p>Sleep één blokje dat je leuk vindt naar het vak.</p>
        <div className="favorite-tray">
          {FAVORITE_BLOCKS.map((block) => (
            <LegoBlock key={block.id} letter={block} />
          ))}
        </div>
        <div
          className={`favorite-target ${favoritePlaced ? "favorite-target--done" : ""}`}
          onDragOver={allowDrop}
          onDrop={(event) => {
            event.preventDefault();
            onFavoriteDrop(event.dataTransfer.getData("application/letter-id"));
          }}
        >
          {favoritePlaced ? "Mooi gekozen!" : "Sleep hierheen"}
        </div>
        {favoritePlaced && (
          <button type="button" className="btn btn--primary btn--large" onClick={onFinish}>
            Probeer opnieuw
          </button>
        )}
      </section>
    );
  }

  if (mode === "easy") {
    return (
      <section className="recovery-panel">
        <h2>Makkelijk woord</h2>
        <p>Kies een woord dat je al kent.</p>
        <div className="recovery-actions">
          {EASY_WORDS.map((word) => (
            <button
              key={word}
              type="button"
              className="btn btn--secondary btn--large"
              onClick={() => onEasyWordSelect(word)}
            >
              {word}
            </button>
          ))}
        </div>
      </section>
    );
  }

  if (mode === "easy-play" && recoveryWord) {
    const wordData = WORDS.find((w) => w.word === recoveryWord);
    const filled = recoverySlots?.every(Boolean);

    return (
      <section className="recovery-panel">
        <h2>Even {recoveryWord}</h2>
        <p>Bouw het woord met de blokjes. Geen druk — dit is even oefenen.</p>
        <DragWordGame
          slots={recoverySlots}
          tray={recoveryTray}
          onDropSlot={onRecoveryDropSlot}
          onDropTray={onRecoveryDropTray}
          instruction="Sleep de blokjes in de juiste volgorde."
        />
        {filled && (
          <button
            type="button"
            className="btn btn--primary btn--large"
            onClick={onEasyPlayDone}
          >
            Goed zo — verder
          </button>
        )}
      </section>
    );
  }

  return null;
}
