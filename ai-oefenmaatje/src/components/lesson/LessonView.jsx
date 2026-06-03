import { useMemo } from "react";
import DragWordGame from "../DragWordGame.jsx";
import BuddyOrb from "../BuddyOrb.jsx";
import PatternGame from "../PatternGame.jsx";
import TypeWordGame from "../TypeWordGame.jsx";
import ListenPrompt from "../ListenPrompt.jsx";
import WordHero from "../WordHero.jsx";
import WordImage from "../WordImage.jsx";
import { PatternRow } from "../PatternGame.jsx";
import { DIFFICULTIES, isDragTask, isListenTask } from "../../data/lesson.js";
import { SESSION_END_PARENT_NOTE, moeilijkStepLabel, DIFFICULTY_HINTS } from "../../lib/lessonScript.js";

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
    difficulty,
    taskType,
    taskMeta,
    currentWord,
    wordIndex,
    wordQueue,
    patternChoiceId,
    patternOptions,
    patternChoice,
    selectPattern,
    typedWord,
    setTypedWord,
    tray,
    slots,
    completedSlots,
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
    pendingTypingStep,
  } = lesson;

  const progressPct = wordQueue.length
    ? Math.round(((wordIndex + 1) / wordQueue.length) * 100)
    : 0;

  const isBlokZien = taskType === "blok-zien";
  const isPatroon = taskType === "patroon-kiezen";
  const isBlokHoren = taskType === "blok-horen";
  const isTypen = taskType === "woord-typen";
  const isDrag = isDragTask(taskType);
  const isListen = isListenTask(taskType);

  const showListenPrompt =
    currentWord && step === "task" && taskPhase === "answer" && isListen;
  const isBlockPlay =
    isDrag && step === "task" && taskPhase === "answer";
  const useCompactShell = isBlockPlay || (isBlokZien && step === "task");
  const inListenTask =
    step === "task" && currentWord && (taskPhase === "answer" || taskPhase === "feedback") && isListen;
  const showTaskRepeats = step === "task" && taskPhase === "answer" && taskInstruction;
  const showRepeatLast =
    taskPhase === "feedback" || (!showTaskRepeats && !inListenTask && !isBlokZien);
  const interactionLocked = taskPhase === "reflect" || speaking;

  const progressLabel = useMemo(() => {
    if (difficulty === "moeilijk") {
      return `${moeilijkStepLabel(taskType)} · Woord ${wordIndex + 1} van ${wordQueue.length}`;
    }
    return `Woord ${wordIndex + 1} van ${wordQueue.length}`;
  }, [difficulty, taskType, wordIndex, wordQueue.length]);

  const buddy = (
    <BuddyOrb
      caption={caption}
      speaking={speaking}
      onRepeat={showRepeatLast ? repeat : undefined}
      onRepeatInstruction={showTaskRepeats ? repeatInstruction : undefined}
      onRepeatWord={inListenTask || isBlokHoren ? replayWord : undefined}
    />
  );

  function renderTaskContent({ readOnly = false } = {}) {
    if (!currentWord) return null;

    if (isBlokZien) {
      return (
        <>
          <div className="word-support">
            <WordImage word={currentWord.word} image={currentWord.image} />
            <WordHero word={currentWord.word} hint="Dit woord bouw je" highlight />
            <p className="word-support__hint">Leg de blokjes hieronder</p>
          </div>
          <DragWordGame
            slots={slots}
            tray={tray}
            onDropSlot={handleDropSlot}
            onDropTray={handleDropTray}
            readOnly={readOnly}
            showLetters={false}
          />
        </>
      );
    }

    if (isPatroon) {
      return (
        <PatternGame
          options={patternOptions}
          selectedId={patternChoiceId}
          onSelect={selectPattern}
          disabled={readOnly || interactionLocked}
        />
      );
    }

    if (isBlokHoren) {
      return (
        <DragWordGame
          slots={slots}
          tray={tray}
          onDropSlot={handleDropSlot}
          onDropTray={handleDropTray}
          readOnly={readOnly}
          showLetters={false}
        />
      );
    }

    if (isTypen) {
      return (
        <>
          {completedSlots.length > 0 && (
            <div className="type-word-game__pattern-recap" aria-label="Jouw patroon">
              <p className="type-word-game__pattern-label">Jouw patroon:</p>
              <PatternRow pattern={completedSlots.map((s) => s.type)} small />
            </div>
          )}
          <TypeWordGame
            value={typedWord}
            onChange={setTypedWord}
            disabled={readOnly || interactionLocked}
          />
        </>
      );
    }

    return null;
  }

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
                <span className="btn--difficulty__label">{d.label}</span>
                <span className="btn--difficulty__hint">{DIFFICULTY_HINTS[d.id]}</span>
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

  const showBlockFeedback =
    taskPhase === "feedback" &&
    completedSlots.length > 0 &&
    (isBlokZien || isBlokHoren || pendingTypingStep || isTypen);

  const showPatternFeedback =
    taskPhase === "feedback" && isPatroon && patternChoice?.length > 0;

  const showWordFeedback =
    taskPhase === "feedback" &&
    !showBlockFeedback &&
    !showPatternFeedback &&
    (isTypen || (isBlokZien && completedSlots.length === 0));

  return (
    <LessonShell buddy={buddy} compact={useCompactShell}>
      <header className="lesson-progress">
        <span className="lesson-progress__game">{taskMeta?.label}</span>
        <div className="lesson-progress__bar">
          <div
            className="lesson-progress__fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="lesson-progress__meta">{progressLabel}</span>
      </header>

      <section className={`lesson-card${useCompactShell ? " lesson-card--blocks" : ""}`}>
        {showListenPrompt && <ListenPrompt />}

        {showBlockFeedback && (
          <div className="feedback-blocks">
            <p className="feedback-blocks__label">Zo heb je het gelegd:</p>
            <DragWordGame slots={completedSlots} tray={[]} readOnly showLetters={false} />
            {(isBlokZien || isTypen) && (
              <WordHero word={currentWord.word} hint="Het woord is" highlight compact />
            )}
          </div>
        )}

        {showPatternFeedback && (
          <div className="feedback-blocks">
            <p className="feedback-blocks__label">Jouw patroon:</p>
            <PatternRow pattern={patternChoice} />
            <WordHero word={currentWord.word} hint="Het woord was" highlight compact />
          </div>
        )}

        {showWordFeedback && (
          <WordHero word={currentWord.word} hint="Het woord was" highlight />
        )}

        {(taskPhase === "answer" || taskPhase === "reflect") && (
          <div
            className={`lesson-card__task${taskPhase === "reflect" ? " lesson-card__task--reflect" : ""}`}
          >
            {renderTaskContent({ readOnly: taskPhase === "reflect" })}
          </div>
        )}

        {taskPhase === "answer" && (
          <div className="lesson-card__actions">
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
            {pendingTypingStep
              ? "Typ het woord →"
              : wordIndex >= wordQueue.length - 1
                ? "Afronden"
                : "Volgend woord →"}
          </button>
        )}
      </section>
    </LessonShell>
  );
}
