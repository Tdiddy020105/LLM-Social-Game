import DragWordGame from "../DragWordGame.jsx";
import BuddyOrb from "../BuddyOrb.jsx";
import PatternGame from "../PatternGame.jsx";
import TypeWordGame from "../TypeWordGame.jsx";
import WordHero from "../WordHero.jsx";
import WordImage from "../WordImage.jsx";
import { PatternRow } from "../PatternGame.jsx";
import BlockLegend from "../BlockLegend.jsx";
import { DIFFICULTIES, isDragTask, showsBlockCount, showsWordText } from "../../data/lesson.js";
import { SESSION_END_PARENT_NOTE, moeilijkStepLabel } from "../../lib/lessonScript.js";

function LessonShell({ buddy, children, fit }) {
  return (
    <div className={`lesson-shell${fit ? " lesson-shell--fit" : ""}`}>
      {buddy}
      <div className="lesson-shell__main">{children}</div>
    </div>
  );
}

function WordSupport({ word, showText }) {
  if (!showText) return null;
  return (
    <div className="word-support word-support--text">
      <WordHero word={word} hint="" highlight />
    </div>
  );
}

function WordPlaatje({ word, image }) {
  if (!image) return null;
  return (
    <div className="word-plaatje">
      <WordImage word={word} image={image} />
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
    typingPattern,
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
  const showWordText = difficulty && showsWordText(difficulty);
  const showBlockCount = difficulty && showsBlockCount(difficulty);

  const useFitLayout = step === "task" || step === "confidence";
  const needsWordReplay =
    step === "task" &&
    currentWord &&
    taskPhase === "answer" &&
    (isPatroon || isBlokHoren || isTypen);
  const showTaskRepeats = step === "task" && taskPhase === "answer";
  const interactionLocked = taskPhase === "reflect" || speaking;

  const progressLabel =
    difficulty === "moeilijk"
      ? `${moeilijkStepLabel(taskType)} · Woord ${wordIndex + 1}/${wordQueue.length}`
      : `Woord ${wordIndex + 1} van ${wordQueue.length}`;

  const buddy = (
    <BuddyOrb
      caption={caption}
      speaking={speaking}
      onRepeat={taskPhase === "feedback" ? repeat : undefined}
      onRepeatInstruction={showTaskRepeats ? repeatInstruction : undefined}
      onRepeatWord={needsWordReplay ? replayWord : undefined}
    />
  );

  function renderTaskContent({ readOnly = false } = {}) {
    if (!currentWord) return null;

    if (isBlokZien) {
      return (
        <>
          <WordSupport word={currentWord.word} showText />
          <BlockLegend
            blockCount={currentWord.letters.length}
            compact
            showCount={showBlockCount}
          />
          <DragWordGame
            slots={slots}
            tray={tray}
            onDropSlot={handleDropSlot}
            onDropTray={handleDropTray}
            readOnly={readOnly}
            showLetters={false}
            hideLegend
            compact
            hideCounts={!showBlockCount}
          />
        </>
      );
    }

    if (isPatroon) {
      return (
        <>
          <BlockLegend compact showCount={false} />
          <PatternGame
            options={patternOptions}
            selectedId={patternChoiceId}
            onSelect={selectPattern}
            disabled={readOnly || interactionLocked}
          />
        </>
      );
    }

    if (isBlokHoren) {
      return (
        <>
          <BlockLegend compact showCount={false} />
          <DragWordGame
            slots={slots}
            tray={tray}
            onDropSlot={handleDropSlot}
            onDropTray={handleDropTray}
            readOnly={readOnly}
            showLetters={false}
            hideLegend
            compact
            flexiblePlacement
            hideCounts
          />
        </>
      );
    }

    if (isTypen) {
      return (
        <>
          {typingPattern.length > 0 && (
            <div className="type-word-game__pattern-recap">
              <PatternRow pattern={typingPattern} small />
            </div>
          )}
          <TypeWordGame
            value={typedWord}
            onChange={setTypedWord}
            disabled={readOnly || interactionLocked}
            autoFocus={!readOnly && taskPhase === "answer"}
          />
        </>
      );
    }

    return null;
  }

  if (step === "difficulty") {
    return (
      <LessonShell buddy={buddy} fit>
        <div className="kid-panel kid-panel--fit">
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

  const showBlockFeedback =
    taskPhase === "feedback" && completedSlots.length > 0 && isDrag;

  const showPatternFeedback =
    taskPhase === "feedback" && isPatroon && patternChoice?.length > 0;

  const showTypingFeedback =
    taskPhase === "feedback" && isTypen && typedWord.trim().length > 0;

  const showWordPlaatje =
    currentWord?.image &&
    (taskPhase === "answer" || taskPhase === "reflect" || taskPhase === "feedback");

  return (
    <LessonShell buddy={buddy} fit={useFitLayout}>
      <header className="lesson-progress lesson-progress--compact">
        <span className="lesson-progress__game">{taskMeta?.label}</span>
        <div className="lesson-progress__bar">
          <div
            className="lesson-progress__fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="lesson-progress__meta">{progressLabel}</span>
      </header>

      <section
        className={`lesson-card lesson-card--fit${isPatroon ? " lesson-card--pattern" : ""}${isDrag ? " lesson-card--blocks" : ""}${isTypen ? " lesson-card--typing" : ""}`}
      >
        {showWordPlaatje && (
          <WordPlaatje word={currentWord.word} image={currentWord.image} />
        )}

        {showBlockFeedback && (
          <div className="feedback-blocks">
            <DragWordGame
              slots={completedSlots}
              tray={[]}
              readOnly
              showLetters={false}
              hideLegend
              flexiblePlacement={isBlokHoren}
            />
            {showWordText && (
              <WordHero word={currentWord.word} hint="" highlight compact />
            )}
          </div>
        )}

        {showPatternFeedback && (
          <div className="feedback-blocks">
            <PatternRow pattern={patternChoice} />
            <WordHero word={currentWord.word} hint="" highlight compact />
          </div>
        )}

        {showTypingFeedback && (
          <div className="feedback-blocks">
            {typingPattern.length > 0 && (
              <div className="type-word-game__pattern-recap">
                <PatternRow pattern={typingPattern} small />
              </div>
            )}
            <WordHero word={typedWord.trim()} hint="" highlight compact />
          </div>
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
              disabled={speaking}
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
              : wordIndex >= wordQueue.length - 1 && !isTypen
                ? "Afronden"
                : "Volgend woord →"}
          </button>
        )}
      </section>
    </LessonShell>
  );
}
