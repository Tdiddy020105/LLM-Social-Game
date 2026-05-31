import DragWordGame from "../DragWordGame.jsx";
import VoicePanel from "../VoicePanel.jsx";
import VowelGame from "../VowelGame.jsx";
import { DIFFICULTIES, FAVORITE_BLOCKS, shuffle } from "../../data/lesson.js";
import * as speech from "../../services/speech.js";
import LegoBlock from "../LegoBlock.jsx";

export default function LessonView({
  lesson,
  config,
  onEndSurvey,
}) {
  const {
    step,
    taskPhase,
    message,
    loading,
    source,
    taskType,
    taskMeta,
    currentWord,
    wordIndex,
    wordQueue,
    correctStreak,
    vowelChoice,
    setVowelChoice,
    tray,
    slots,
    confidenceMode,
    favoritePlaced,
    setFavoritePlaced,
    canSubmit,
    pickDifficulty,
    submitAnswer,
    keepAnswer,
    changeAnswer,
    advanceWord,
    setConfidenceMode,
    finishConfidence,
    handleDropSlot,
    handleDropTray,
    repeat,
    replayWord,
  } = lesson;

  const vowelOptions = currentWord
    ? shuffle([...currentWord.vowelOptions])
    : [];

  const progressPct = wordQueue.length
    ? Math.round(((wordIndex + (taskPhase === "feedback" ? 1 : 0)) / wordQueue.length) * 100)
    : 0;

  if (step === "difficulty") {
    return (
      <div className="lesson-child">
        <VoicePanel
          message={message}
          loading={loading}
          onRepeat={repeat}
          aiSource={source}
          voiceName={config?.tts?.voiceName}
        />
        <section className="lesson-card">
          <p className="lesson-card__hint">Kies één optie</p>
          <div className="choice-row">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.id}
                type="button"
                className="btn btn--choice"
                disabled={loading}
                onClick={() => pickDifficulty(d.id)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (step === "confidence") {
    return (
      <div className="lesson-child">
        <VoicePanel
          message={message}
          loading={loading}
          onRepeat={repeat}
          aiSource={source}
          voiceName={config?.tts?.voiceName}
        />
        <section className="lesson-card">
          {confidenceMode === "choose" && (
            <>
              <h2 className="lesson-card__title">Even rustig</h2>
              <div className="choice-row">
                <button
                  type="button"
                  className="btn btn--choice"
                  onClick={() => {
                    setConfidenceMode("favorite");
                    speech.speak("Klik op je favoriete blok.");
                  }}
                >
                  Favoriete blok
                </button>
                <button
                  type="button"
                  className="btn btn--choice"
                  onClick={() => setConfidenceMode("quiz")}
                >
                  Klein woordspel
                </button>
              </div>
            </>
          )}
          {confidenceMode === "favorite" && (
            <>
              <p className="lesson-card__hint">Sleep je favoriete blok naar het vak.</p>
              <div className="favorite-tray">
                {FAVORITE_BLOCKS.map((b) => (
                  <LegoBlock key={b.id} letter={b} />
                ))}
              </div>
              <div
                className={`favorite-target ${favoritePlaced ? "favorite-target--done" : ""}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData("application/letter-id");
                  if (id?.startsWith("fav-")) setFavoritePlaced(true);
                }}
              >
                {favoritePlaced ? "Mooi!" : "Hier"}
              </div>
              {favoritePlaced && (
                <button type="button" className="btn btn--primary btn--large" onClick={finishConfidence}>
                  Verder
                </button>
              )}
            </>
          )}
          {confidenceMode === "quiz" && (
            <>
              <p className="lesson-card__hint">Welk woord begint met m?</p>
              <div className="choice-row">
                <button
                  type="button"
                  className="btn btn--choice"
                  onClick={finishConfidence}
                >
                  maan
                </button>
                <button
                  type="button"
                  className="btn btn--choice"
                  onClick={finishConfidence}
                >
                  boom
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    );
  }

  if (step === "ai_intro") {
    return (
      <div className="lesson-child lesson-child--waiting">
        <VoicePanel
          message={message}
          loading={loading}
          onRepeat={repeat}
          aiSource={source}
          voiceName={config?.tts?.voiceName}
        />
        <p className="lesson-card__hint">Luister naar je oefenmaatje…</p>
      </div>
    );
  }

  if (step === "lesson_done") {
    return (
      <div className="lesson-child">
        <VoicePanel
          message={message}
          loading={loading}
          onRepeat={repeat}
          aiSource={source}
          voiceName={config?.tts?.voiceName}
        />
        <button
          type="button"
          className="btn btn--primary btn--large"
          onClick={onEndSurvey}
        >
          Naar vragenlijst
        </button>
      </div>
    );
  }

  return (
    <div className="lesson-child">
      <header className="lesson-progress">
        <span>{taskMeta?.label}</span>
        <div className="lesson-progress__bar">
          <div className="lesson-progress__fill" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="lesson-progress__meta">
          Woord {wordIndex + 1}/{wordQueue.length} · Reeks {correctStreak}
        </span>
      </header>

      <VoicePanel
        message={message}
        loading={loading}
        onRepeat={repeat}
        aiSource={source}
        voiceName={config?.tts?.voiceName}
      />

      <section className="lesson-card">
        {taskPhase === "answer" && (
          <>
            {taskType === "klinker-detective" && currentWord && (
              <VowelGame
                word={currentWord.word}
                options={vowelOptions}
                selected={vowelChoice}
                onSelect={setVowelChoice}
                onReplay={replayWord}
              />
            )}
            {taskType === "klank-volgorde" && (
              <DragWordGame
                slots={slots}
                tray={tray}
                onDropSlot={handleDropSlot}
                onDropTray={handleDropTray}
                instruction="Zet de klanken in de goede volgorde."
              />
            )}
            {taskType === "woord-bouwen" && (
              <DragWordGame
                slots={slots}
                tray={tray}
                onDropSlot={handleDropSlot}
                onDropTray={handleDropTray}
                instruction="Sleep de blokjes. Rood = medeklinker, wit = klinker."
              />
            )}
            <div className="lesson-actions">
              {taskType === "klinker-detective" && (
                <button type="button" className="btn btn--ghost" onClick={replayWord}>
                  Woord nog eens
                </button>
              )}
              <button
                type="button"
                className="btn btn--primary btn--large"
                disabled={!canSubmit || loading}
                onClick={submitAnswer}
              >
                Klaar
              </button>
            </div>
          </>
        )}

        {taskPhase === "reflect_choice" && (
          <div className="lesson-actions lesson-actions--stack">
            <button
              type="button"
              className="btn btn--primary btn--large"
              disabled={loading}
              onClick={keepAnswer}
            >
              Ik blijf bij mijn antwoord
            </button>
            <button
              type="button"
              className="btn btn--secondary btn--large"
              onClick={changeAnswer}
            >
              Ik wil veranderen
            </button>
          </div>
        )}

        {taskPhase === "feedback" && (
          <div className="lesson-actions">
            <button
              type="button"
              className="btn btn--primary btn--large"
              disabled={loading}
              onClick={async () => {
                const done = await advanceWord();
                if (done) onEndSurvey();
              }}
            >
              {wordIndex >= wordQueue.length - 1 && !lesson.pendingLevelUp
                ? "Afronden"
                : "Volgende"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
