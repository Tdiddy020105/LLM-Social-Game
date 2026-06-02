import { useMemo } from "react";
import DragWordGame from "../DragWordGame.jsx";
import BuddyOrb from "../BuddyOrb.jsx";
import VowelGame from "../VowelGame.jsx";
import ListenPrompt from "../ListenPrompt.jsx";
import WordHero from "../WordHero.jsx";
import { DIFFICULTIES, shuffle } from "../../data/lesson.js";
import { SESSION_END_PARENT_NOTE } from "../../lib/lessonScript.js";

function LessonShell({ buddy, children, compact }) {
  return (
    <div className={`lesson-shell${compact ? " lesson-shell--blocks" : ""}`}>
      {buddy}
      <div className="lesson-shell__main">{children}</div>
    </div>
  );
}

export default function LessonView({ lesson, onRestart }) {
  const {
    step,
    taskPhase,
    caption,
    speaking,
    taskType,
    taskMeta,
    currentWord,
    wordIndex,
    wordQueue,
    vowelChoice,
    selectVowel,
    tray,
    slots,
    canSubmit,
    pickDifficulty,
    submitAnswer,
    keepAnswer,
    changeAnswer,
    advanceWord,
    finishConfidence,
    handleDropSlot,
    handleDropTray,
    repeat,
    repeatInstruction,
    replayWord,
    taskInstruction,
    pendingLevelUp,
  } = lesson;

  const vowelOptions = useMemo(
    () =>
      currentWord ? shuffle([...currentWord.vowelOptions]) : [],
    [currentWord?.word]
  );

  const progressPct = wordQueue.length
    ? Math.round(((wordIndex + 1) / wordQueue.length) * 100)
    : 0;

  const isKlinker = taskType === "klinker-detective";
  const isDrag = taskType === "blok-puzzel";
  const showListenPrompt =
    currentWord && step === "task" && taskPhase === "answer" && (isKlinker || isDrag);
  const showWordHero =
    currentWord && step === "task" && taskPhase === "feedback";
  const isBlockPlay = isDrag && step === "task" && taskPhase === "answer";
  const inListenTask =
    step === "task" && currentWord && (taskPhase === "answer" || taskPhase === "feedback");
  const showTaskRepeats = step === "task" && taskPhase === "answer" && taskInstruction;
  const showRepeatLast =
    taskPhase === "feedback" || (!showTaskRepeats && !inListenTask);

  const buddy = (
    <BuddyOrb
      caption={caption}
      speaking={speaking}
      onRepeat={showRepeatLast ? repeat : undefined}
      onRepeatInstruction={showTaskRepeats ? repeatInstruction : undefined}
      onRepeatWord={inListenTask ? replayWord : undefined}
    />
  );

  if (step === "difficulty") {
    return (
      <LessonShell buddy={buddy}>
        <div className="kid-panel">
          <p className="kid-step-label">Kies je niveau</p>
          <div className="difficulty-grid">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.id}
                type="button"
                className="btn btn--difficulty"
                disabled={speaking}
                onClick={() => pickDifficulty(d.id)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </LessonShell>
    );
  }

  if (step === "confidence") {
    return (
      <LessonShell buddy={buddy}>
        <button
          type="button"
          className="btn btn--kid-primary"
          disabled={speaking}
          onClick={finishConfidence}
        >
          Verder oefenen
        </button>
      </LessonShell>
    );
  }

  if (step === "lesson_done") {
    return (
      <LessonShell buddy={buddy}>
        <p className="lesson-done-parent">{SESSION_END_PARENT_NOTE}</p>
        {onRestart && (
          <button type="button" className="btn btn--kid-secondary" onClick={onRestart}>
            Opnieuw beginnen
          </button>
        )}
      </LessonShell>
    );
  }

  return (
    <LessonShell buddy={buddy} compact={isBlockPlay}>
      <header className="lesson-progress">
        <span className="lesson-progress__game">{taskMeta?.label}</span>
        <div className="lesson-progress__bar">
          <div
            className="lesson-progress__fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="lesson-progress__meta">
          Woord {wordIndex + 1} van {wordQueue.length}
        </span>
      </header>

      <section className={`lesson-card${isBlockPlay ? " lesson-card--blocks" : ""}`}>
        {showListenPrompt && <ListenPrompt />}

        {showWordHero && (
          <WordHero word={currentWord.word} hint="Het woord was" highlight />
        )}

        {taskPhase === "answer" && (
          <div className="lesson-card__actions">
            {isKlinker && currentWord && (
              <VowelGame
                options={vowelOptions}
                selected={vowelChoice}
                onSelect={selectVowel}
              />
            )}
            {isDrag && (
              <DragWordGame
                slots={slots}
                tray={tray}
                onDropSlot={handleDropSlot}
                onDropTray={handleDropTray}
              />
            )}
            <button
              type="button"
              className="btn btn--kid-primary"
              disabled={!canSubmit || speaking}
              onClick={submitAnswer}
            >
              Klaar
            </button>
          </div>
        )}

        {taskPhase === "reflect" && (
          <div className="reflect-box">
            <button
              type="button"
              className="btn btn--kid-primary"
              disabled={speaking}
              onClick={keepAnswer}
            >
              Ja, dit klopt
            </button>
            <button
              type="button"
              className="btn btn--kid-secondary"
              onClick={changeAnswer}
            >
              Ik wil iets veranderen
            </button>
          </div>
        )}

        {taskPhase === "feedback" && (
          <button
            type="button"
            className="btn btn--kid-primary"
            disabled={speaking}
            onClick={() => advanceWord()}
          >
            {pendingLevelUp
              ? "Blok-puzzel →"
              : wordIndex >= wordQueue.length - 1
                ? "Afronden"
                : "Volgend woord →"}
          </button>
        )}
      </section>
    </LessonShell>
  );
}
