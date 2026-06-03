import { useCallback, useRef, useState } from "react";
import {
  TASK_TYPES,
  buildWordQueue,
  dragPatternMatches,
  dragCanSubmit,
  filledTypesInOrder,
  getPatternOptions,
  getTaskForDifficulty,
  initDragState,
  isDragTask,
  showsWordText,
  patternMatches,
  typedWordMatches,
  wordTtsPhrase,
} from "../data/lesson.js";
import {
  DIFFICULTY_LINE,
  KID_INTRO_LINE,
  REFLECT_LINE,
  taskHint,
} from "../lib/lessonScript.js";
import { getLessonFallback } from "../lib/lessonFallbacks.js";
import { splitSpeechChunks } from "../lib/speechChunks.js";
import * as speech from "../services/speech.js";

function lineText(line) {
  if (typeof line === "string") return line;
  return line?.line || "";
}

function fallbackForPhase(phase, taskType, { mistakeCount, correct } = {}) {
  return getLessonFallback({ phase, taskType, mistakeCount, correct });
}

export function useLesson({ aiEnabled = false } = {}) {
  void aiEnabled;

  const [step, setStep] = useState("difficulty");
  const [taskPhase, setTaskPhase] = useState("answer");
  const [caption, setCaption] = useState("");
  const [speaking, setSpeaking] = useState(false);

  const lastSpokenRef = useRef("");
  const lessonStartedRef = useRef(false);
  const introHeardRef = useRef(false);
  const taskIntroHeardRef = useRef(false);
  const taskInstructionRef = useRef("");

  const [difficulty, setDifficulty] = useState(null);
  const [taskType, setTaskType] = useState("blok-zien");
  const [wordQueue, setWordQueue] = useState([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);

  const [patternChoiceId, setPatternChoiceId] = useState(null);
  const [patternChoice, setPatternChoice] = useState(null);
  const [patternOptions, setPatternOptions] = useState([]);
  const [typedWord, setTypedWord] = useState("");
  const [tray, setTray] = useState([]);
  const [slots, setSlots] = useState([]);
  const [completedSlots, setCompletedSlots] = useState([]);
  const [typingPattern, setTypingPattern] = useState([]);
  const [pendingTypingStep, setPendingTypingStep] = useState(false);
  const pendingTypingRef = useRef(false);
  const checkingRef = useRef(false);
  const difficultyRef = useRef(null);

  const currentWord = wordQueue[wordIndex];
  const taskMeta = TASK_TYPES.find((t) => t.id === taskType);

  pendingTypingRef.current = pendingTypingStep;
  difficultyRef.current = difficulty;

  const resolveDifficulty = useCallback(
    (override) => override ?? difficulty ?? difficultyRef.current,
    [difficulty]
  );

  const speakCaption = useCallback(async (text, { interrupt = false } = {}) => {
    const line = text?.trim();
    if (!line) return;
    lastSpokenRef.current = line;
    const chunks = splitSpeechChunks(line);
    if (interrupt) speech.interruptSpeech();

    setSpeaking(true);
    for (const chunk of chunks) {
      setCaption(chunk);
      await speech.speakAndWait(chunk);
    }
    setSpeaking(false);
  }, []);

  /** Voice only — caption stays empty (normaal/moeilijk woord). */
  const speakWordVoiceOnly = useCallback(
    async (word, { interrupt = false, difficulty: levelOverride } = {}) => {
      if (!word) return;
      const level = resolveDifficulty(levelOverride);
      const phrase = wordTtsPhrase(word, level);
      lastSpokenRef.current = phrase;
      if (interrupt) speech.interruptSpeech();
      setSpeaking(true);
      setCaption("");
      await speech.speakAndWait(phrase, { interrupt, force: true });
      setSpeaking(false);
    },
    [resolveDifficulty]
  );

  const speakWord = useCallback(
    async (word, { interrupt = false, difficulty: levelOverride } = {}) => {
      const level = resolveDifficulty(levelOverride);
      if (!word || !level) return;
      if (showsWordText(level)) {
        await speakCaption(wordTtsPhrase(word, level), { interrupt });
      } else {
        await speakWordVoiceOnly(word, { interrupt, difficulty: level });
      }
    },
    [resolveDifficulty, speakCaption, speakWordVoiceOnly]
  );

  const speakInstruction = useCallback(
    async (text, options = {}) => {
      const line = text?.trim();
      if (line) taskInstructionRef.current = line;
      await speakCaption(line, options);
    },
    [speakCaption]
  );

  const sayPhase = useCallback(
    async (phase, extra = {}, { interrupt = false } = {}) => {
      const line = fallbackForPhase(phase, taskType, extra);
      if (!line) return;
      await speakCaption(line, { interrupt });
    },
    [speakCaption, taskType]
  );

  const resetTaskUI = useCallback((word, nextTaskType) => {
    setPatternChoiceId(null);
    setPatternChoice(null);
    setTypedWord("");
    setMistakeCount(0);
    setTaskPhase("answer");
    setPendingTypingStep(false);
    setCompletedSlots([]);
    setTypingPattern([]);

    if (nextTaskType === "patroon-kiezen") {
      setPatternOptions(getPatternOptions(word));
      setTray([]);
      setSlots([]);
      return;
    }

    if (nextTaskType === "woord-typen") {
      setTray([]);
      setSlots([]);
      return;
    }

    if (isDragTask(nextTaskType)) {
      const drag = initDragState(word.word, nextTaskType);
      setTray(drag.tray);
      setSlots(drag.slots);
      return;
    }

    setTray([]);
    setSlots([]);
  }, []);

  const resetLesson = useCallback(() => {
    lessonStartedRef.current = false;
    taskInstructionRef.current = "";
    setStep("difficulty");
    setTaskPhase("answer");
    setCaption("");
    setSpeaking(false);
    setDifficulty(null);
    difficultyRef.current = null;
    setTaskType("blok-zien");
    setWordQueue([]);
    setWordIndex(0);
    setMistakeCount(0);
    setPatternChoiceId(null);
    setPatternChoice(null);
    setPatternOptions([]);
    setTypedWord("");
    setTray([]);
    setSlots([]);
    setCompletedSlots([]);
    setTypingPattern([]);
    setPendingTypingStep(false);
  }, []);

  const startLesson = useCallback(async () => {
    if (lessonStartedRef.current) return;
    lessonStartedRef.current = true;
    setStep("difficulty");
    if (introHeardRef.current) return;
    introHeardRef.current = true;
    await speakCaption(KID_INTRO_LINE.line, { interrupt: true });
    await speakCaption(DIFFICULTY_LINE.line);
  }, [speakCaption]);

  const beginWordTask = useCallback(
    async (wordData, nextTaskType, { speakTaskIntro = false, difficulty: levelOverride } = {}) => {
      const level = resolveDifficulty(levelOverride);
      setTaskType(nextTaskType);
      resetTaskUI(wordData, nextTaskType);

      if (speakTaskIntro && !taskIntroHeardRef.current) {
        await speakInstruction(lineText(taskHint(nextTaskType)));
        taskIntroHeardRef.current = true;
      }

      await speakWord(wordData.word, { difficulty: level });
    },
    [resetTaskUI, speakInstruction, speakWord, resolveDifficulty]
  );

  const pickDifficulty = useCallback(
    async (level) => {
      const queue = buildWordQueue(level);
      const first = queue[0];
      const initialTask = getTaskForDifficulty(level);

      difficultyRef.current = level;
      setDifficulty(level);
      setWordQueue(queue);
      setWordIndex(0);
      setStep("task");

      await beginWordTask(first, initialTask, {
        speakTaskIntro: true,
        difficulty: level,
      });
    },
    [beginWordTask]
  );

  const startConfidenceBreak = useCallback(() => {
    setStep("confidence");
  }, []);

  const evaluateAnswer = useCallback(() => {
    if (!currentWord) return false;
    if (taskType === "patroon-kiezen") {
      return patternMatches(patternChoice, currentWord);
    }
    if (taskType === "woord-typen") {
      return typedWordMatches(typedWord, currentWord.word);
    }
    if (isDragTask(taskType)) {
      return dragPatternMatches(slots, currentWord, taskType);
    }
    return false;
  }, [currentWord, taskType, patternChoice, slots, typedWord]);

  const checkAnswer = useCallback(async () => {
    if (!currentWord || checkingRef.current) return;
    checkingRef.current = true;

    try {
      const correct = evaluateAnswer();

      if (correct) {
        setTaskPhase("feedback");
        if (isDragTask(taskType)) {
          setCompletedSlots(slots.filter(Boolean));
        }
        await sayPhase("feedback_correct", { correct: true });

        if (difficulty === "moeilijk" && taskType === "blok-horen") {
          setTypingPattern(filledTypesInOrder(slots));
          setPendingTypingStep(true);
        }
        return;
      }

      const nextMistake = mistakeCount + 1;
      setMistakeCount(nextMistake);

      if (nextMistake >= 3) {
        await sayPhase("confidence_start", { correct: false, mistakeCount: 3 });
        startConfidenceBreak();
        return;
      }

      await sayPhase("feedback_wrong", { correct: false, mistakeCount: nextMistake });
      await speakWord(currentWord.word);

      setTaskPhase("answer");

      if (taskType === "patroon-kiezen") {
        setPatternChoiceId(null);
        setPatternChoice(null);
      } else if (taskType === "woord-typen") {
        setTypedWord("");
      } else if (isDragTask(taskType)) {
        const drag = initDragState(currentWord.word, taskType);
        setTray(drag.tray);
        setSlots(drag.slots);
      }
    } finally {
      checkingRef.current = false;
    }
  }, [
    currentWord,
    evaluateAnswer,
    mistakeCount,
    difficulty,
    taskType,
    slots,
    sayPhase,
    speakWord,
    startConfidenceBreak,
  ]);

  const submitAnswer = useCallback(async () => {
    if (!currentWord) return;
    setTaskPhase("reflect");
    await speakCaption(REFLECT_LINE.line);
  }, [currentWord, speakCaption]);

  const keepAnswer = useCallback(() => {
    checkAnswer();
  }, [checkAnswer]);

  const changeAnswer = useCallback(() => {
    setTaskPhase("answer");
  }, []);

  const finishConfidence = useCallback(async () => {
    setStep("task");
    setMistakeCount(0);
    resetTaskUI(currentWord, taskType);
    await speakWord(currentWord.word);
  }, [currentWord, taskType, resetTaskUI, speakWord]);

  const startTypingStep = useCallback(async () => {
    setPendingTypingStep(false);
    setTaskType("woord-typen");
    setTaskPhase("answer");
    setMistakeCount(0);
    setTypedWord("");
    setSlots([]);
    setTray([]);

    const hint = lineText(taskHint("woord-typen"));
    setCaption(hint);
    await speakInstruction(hint);

    if (currentWord?.word) {
      await speakWord(currentWord.word);
    }
  }, [speakInstruction, speakWord, currentWord]);

  const advanceWord = useCallback(async () => {
    if (pendingTypingRef.current) {
      await startTypingStep();
      return;
    }

    if (wordIndex >= wordQueue.length - 1) {
      setStep("lesson_done");
      await sayPhase("session_end");
      return;
    }

    const next = wordIndex + 1;
    const wordData = wordQueue[next];
    const baseTask = getTaskForDifficulty(difficulty);

    setWordIndex(next);
    await beginWordTask(wordData, baseTask, { speakTaskIntro: false });
  }, [
    startTypingStep,
    wordIndex,
    wordQueue,
    difficulty,
    beginWordTask,
    sayPhase,
  ]);

  const canSubmit =
    taskType === "patroon-kiezen"
      ? Boolean(patternChoice)
      : taskType === "woord-typen"
        ? typedWord.trim().length > 0
        : isDragTask(taskType)
          ? dragCanSubmit(slots, currentWord, taskType)
          : false;

  const selectPattern = useCallback((id, pattern) => {
    setPatternChoiceId(id);
    setPatternChoice(pattern);
  }, []);

  const repeat = useCallback(() => {
    if (!lastSpokenRef.current) return Promise.resolve();
    return speakCaption(lastSpokenRef.current, { interrupt: true });
  }, [speakCaption]);

  const repeatInstruction = useCallback(() => {
    if (!taskInstructionRef.current) return Promise.resolve();
    return speakCaption(taskInstructionRef.current, { interrupt: true });
  }, [speakCaption]);

  return {
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
    patternChoice,
    patternOptions,
    selectPattern,
    typedWord,
    setTypedWord,
    tray,
    slots,
    completedSlots,
    typingPattern,
    canSubmit,
    pendingTypingStep,
    taskInstruction: taskInstructionRef.current,
    resetLesson,
    startLesson,
    pickDifficulty,
    submitAnswer,
    keepAnswer,
    changeAnswer,
    finishConfidence,
    advanceWord,
    startConfidenceBreak,
    checkAnswer,
    handleDropSlot: (slotIndex, letterId) => {
      const fromSlot = slots.findIndex((item) => item?.id === letterId);
      const letter =
        tray.find((item) => item.id === letterId) ||
        (fromSlot !== -1 ? slots[fromSlot] : null);
      if (!letter) return;

      const displaced = slots[slotIndex];
      const nextSlots = [...slots];
      if (fromSlot !== -1) nextSlots[fromSlot] = null;
      nextSlots[slotIndex] = letter;

      const nextTray = tray.filter((item) => item.id !== letterId);
      if (displaced && displaced.id !== letterId) {
        nextTray.push(displaced);
      }

      setTray(nextTray);
      setSlots(nextSlots);
    },
    handleDropTray: (letterId) => {
      const fromSlot = slots.findIndex((item) => item?.id === letterId);
      if (fromSlot === -1) return;
      const letter = slots[fromSlot];
      if (!letter) return;

      const nextSlots = [...slots];
      nextSlots[fromSlot] = null;
      setSlots(nextSlots);
      setTray((prev) => [...prev, letter]);
    },
    repeat,
    repeatInstruction,
    replayWord: () => currentWord && speakWord(currentWord.word, { interrupt: true }),
  };
}
