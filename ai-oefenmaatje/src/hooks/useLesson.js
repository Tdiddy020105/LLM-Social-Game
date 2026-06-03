import { useCallback, useRef, useState } from "react";
import {
  TASK_TYPES,
  buildWordQueue,
  dragPatternMatches,
  getPatternOptions,
  getTaskForDifficulty,
  initDragState,
  isDragTask,
  isListenTask,
  maskWordInText,
  patternMatches,
  typedWordMatches,
  wordTtsText,
} from "../data/lesson.js";
import {
  BLOCK_LEGEND_LINE,
  CONFIDENCE_LINE,
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
  return getLessonFallback({
    phase,
    taskType,
    mistakeCount,
    correct,
  });
}

function shouldMaskWord(taskType, taskPhase, step, difficulty) {
  if (step !== "task") return false;
  if (taskPhase === "feedback") return false;
  if (taskType === "blok-zien") return false;
  if (taskType === "woord-typen") return false;
  return isListenTask(taskType) || taskType === "blok-horen";
}

export function useLesson({ aiEnabled = false } = {}) {
  void aiEnabled;

  const [step, setStep] = useState("difficulty");
  const [taskPhase, setTaskPhase] = useState("answer");
  const [caption, setCaption] = useState("");
  const [speaking, setSpeaking] = useState(false);

  const lastSpokenRef = useRef("");
  const lastMaskWordsRef = useRef([]);
  const taskInstructionRef = useRef("");
  const lessonStartedRef = useRef(false);
  const blockLegendSpokenRef = useRef(false);

  const [difficulty, setDifficulty] = useState(null);
  const [taskType, setTaskType] = useState("blok-zien");
  const [wordQueue, setWordQueue] = useState([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [correctStreak, setCorrectStreak] = useState(0);

  const [patternChoiceId, setPatternChoiceId] = useState(null);
  const [patternChoice, setPatternChoice] = useState(null);
  const [patternOptions, setPatternOptions] = useState([]);
  const [typedWord, setTypedWord] = useState("");
  const [tray, setTray] = useState([]);
  const [slots, setSlots] = useState([]);
  const [completedSlots, setCompletedSlots] = useState([]);
  const [pendingTypingStep, setPendingTypingStep] = useState(false);

  const [taskInstruction, setTaskInstruction] = useState("");

  const currentWord = wordQueue[wordIndex];
  const taskMeta = TASK_TYPES.find((t) => t.id === taskType);
  const isMoeilijkTyping =
    difficulty === "moeilijk" && taskType === "woord-typen";

  const speakCaption = useCallback(async (text, { interrupt = false, maskWords } = {}) => {
    const line = text?.trim();
    if (!line) return;
    lastSpokenRef.current = line;
    lastMaskWordsRef.current = maskWords ?? [];
    const chunks = splitSpeechChunks(line);
    if (interrupt) speech.interruptSpeech();

    setSpeaking(true);
    for (const chunk of chunks) {
      const displayChunk =
        maskWords?.length > 0 ? maskWordInText(chunk, maskWords) : chunk;
      setCaption(displayChunk);
      await speech.speakAndWait(chunk);
    }
    setSpeaking(false);
  }, []);

  const speakInstruction = useCallback(
    async (text, options = {}) => {
      const line = text?.trim();
      if (line) {
        taskInstructionRef.current = line;
        setTaskInstruction(line);
      }
      await speakCaption(line, options);
    },
    [speakCaption]
  );

  const speakWord = useCallback(
    async (word, { interrupt = false } = {}) => {
      if (!word) return;
      const phrase = wordTtsText(word);
      const mask =
        shouldMaskWord(taskType, taskPhase, step, difficulty) ? [word] : [];
      await speakCaption(phrase, { interrupt, maskWords: mask });
    },
    [speakCaption, taskType, taskPhase, step, difficulty]
  );

  const sayPhase = useCallback(
    async (phase, extra = {}, { interrupt = false } = {}) => {
      const line = fallbackForPhase(phase, taskType, extra);
      const maskWords =
        shouldMaskWord(taskType, taskPhase, step, difficulty) && currentWord?.word
          ? [currentWord.word]
          : [];
      await speakCaption(line, { interrupt, maskWords });
    },
    [speakCaption, taskType, taskPhase, step, difficulty, currentWord]
  );

  const resetTaskUI = useCallback((word, nextTaskType, { keepCompletedSlots = false } = {}) => {
    setPatternChoiceId(null);
    setPatternChoice(null);
    setTypedWord("");
    setMistakeCount(0);
    setTaskPhase("answer");
    setPendingTypingStep(false);
    if (!keepCompletedSlots) setCompletedSlots([]);

    if (nextTaskType === "patroon-kiezen") {
      setPatternOptions(getPatternOptions(word));
      setTray([]);
      setSlots([]);
      return;
    }

    if (isDragTask(nextTaskType)) {
      const drag = initDragState(word.word);
      setTray(drag.tray);
      setSlots(drag.slots);
      return;
    }

    if (nextTaskType === "woord-typen") {
      setTray([]);
      return;
    }

    setTray([]);
    setSlots([]);
  }, []);

  const resetLesson = useCallback(() => {
    lessonStartedRef.current = false;
    blockLegendSpokenRef.current = false;
    taskInstructionRef.current = "";
    setTaskInstruction("");
    setStep("difficulty");
    setTaskPhase("answer");
    setCaption("");
    setSpeaking(false);
    setDifficulty(null);
    setTaskType("blok-zien");
    setWordQueue([]);
    setWordIndex(0);
    setMistakeCount(0);
    setCorrectStreak(0);
    setPatternChoiceId(null);
    setPatternChoice(null);
    setPatternOptions([]);
    setTypedWord("");
    setTray([]);
    setSlots([]);
    setCompletedSlots([]);
    setPendingTypingStep(false);
  }, []);

  const startLesson = useCallback(async () => {
    if (lessonStartedRef.current) return;
    lessonStartedRef.current = true;
    setStep("difficulty");
    await speakInstruction(KID_INTRO_LINE.line, { interrupt: true });
    await speakInstruction(DIFFICULTY_LINE.line);
  }, [speakInstruction]);

  const beginWordTask = useCallback(
    async (wordData, nextTaskType, { playWord = false, speakLegend = false } = {}) => {
      setTaskType(nextTaskType);
      resetTaskUI(wordData, nextTaskType);

      if (speakLegend && isDragTask(nextTaskType) && !blockLegendSpokenRef.current) {
        blockLegendSpokenRef.current = true;
        await speakInstruction(BLOCK_LEGEND_LINE.line);
      }

      await speakInstruction(lineText(taskHint(nextTaskType)));

      if (playWord && isListenTask(nextTaskType)) {
        await speakWord(wordData.word);
      }
    },
    [resetTaskUI, speakInstruction, speakWord]
  );

  const pickDifficulty = useCallback(
    async (level) => {
      const queue = buildWordQueue(level);
      const first = queue[0];
      const initialTask = getTaskForDifficulty(level);

      setDifficulty(level);
      setWordQueue(queue);
      setWordIndex(0);
      setCorrectStreak(0);
      setStep("task");

      await beginWordTask(first, initialTask, {
        playWord: isListenTask(initialTask),
        speakLegend: isDragTask(initialTask),
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
    if (taskType === "blok-zien") {
      return dragPatternMatches(slots, currentWord);
    }
    if (taskType === "blok-horen") {
      return dragPatternMatches(slots, currentWord);
    }
    if (taskType === "woord-typen") {
      return typedWordMatches(typedWord, currentWord.word);
    }
    return false;
  }, [currentWord, taskType, patternChoice, slots, typedWord]);

  const checkAnswer = useCallback(async () => {
    if (!currentWord) return;

    const correct = evaluateAnswer();

    if (correct) {
      setTaskPhase("feedback");
      const streak = correctStreak + 1;
      setCorrectStreak(streak);
      await sayPhase("feedback_correct", { correct: true });

      if (isDragTask(taskType)) {
        setCompletedSlots([...slots]);
      }

      if (difficulty === "moeilijk" && taskType === "blok-horen") {
        setPendingTypingStep(true);
        return;
      }

      return;
    }

    const nextMistake = mistakeCount + 1;
    setMistakeCount(nextMistake);
    setCorrectStreak(0);

    if (nextMistake >= 3) {
      await sayPhase("confidence_start", { correct: false, mistakeCount: 3 });
      startConfidenceBreak();
      return;
    }

    await sayPhase("feedback_wrong", { correct: false, mistakeCount: nextMistake });

    if (isListenTask(taskType)) {
      await speakWord(currentWord.word);
    }

    setTaskPhase("answer");

    if (taskType === "patroon-kiezen") {
      setPatternChoiceId(null);
      setPatternChoice(null);
    } else if (taskType === "woord-typen") {
      setTypedWord("");
    } else if (isDragTask(taskType)) {
      const drag = initDragState(currentWord.word);
      setTray(drag.tray);
      setSlots(drag.slots);
    }
  }, [
    currentWord,
    evaluateAnswer,
    correctStreak,
    mistakeCount,
    difficulty,
    taskType,
    slots,
    sayPhase,
    speakWord,
    speakInstruction,
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
    await speakInstruction(lineText(taskHint(taskType)));
    if (isListenTask(taskType)) {
      await speakWord(currentWord.word);
    }
  }, [currentWord, taskType, resetTaskUI, speakInstruction, speakWord]);

  const startTypingStep = useCallback(async () => {
    setPendingTypingStep(false);
    setTaskType("woord-typen");
    setTaskPhase("answer");
    setMistakeCount(0);
    setTypedWord("");
    await speakInstruction(lineText(taskHint("woord-typen")));
  }, [speakInstruction]);

  const advanceWord = useCallback(async () => {
    if (pendingTypingStep) {
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
    await beginWordTask(wordData, baseTask, {
      playWord: isListenTask(baseTask),
      speakLegend: false,
    });
  }, [pendingTypingStep, startTypingStep, wordIndex, wordQueue, difficulty, beginWordTask, sayPhase]);

  const canSubmit =
    taskType === "patroon-kiezen"
      ? Boolean(patternChoice)
      : taskType === "woord-typen"
        ? typedWord.trim().length > 0
        : isDragTask(taskType)
          ? slots.every(Boolean)
          : false;

  const selectPattern = useCallback((id, pattern) => {
    setPatternChoiceId(id);
    setPatternChoice(pattern);
  }, []);

  const repeat = useCallback(() => {
    if (!lastSpokenRef.current) return Promise.resolve();
    return speakCaption(lastSpokenRef.current, {
      interrupt: true,
      maskWords: lastMaskWordsRef.current,
    });
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
    canSubmit,
    taskInstruction,
    isMoeilijkTyping,
    pendingTypingStep,
    resetLesson,
    startLesson,
    pickDifficulty,
    submitAnswer,
    keepAnswer,
    changeAnswer,
    finishConfidence,
    advanceWord,
    startTypingStep,
    startConfidenceBreak,
    checkAnswer,
    handleDropSlot: (slotIndex, letterId) => {
      const fromSlot = slots.findIndex((item) => item?.id === letterId);
      const letter =
        tray.find((item) => item.id === letterId) ||
        (fromSlot !== -1 ? slots[fromSlot] : null);
      if (!letter) return;
      setTray((prev) => prev.filter((item) => item.id !== letterId));
      setSlots((prev) => {
        const next = [...prev];
        if (fromSlot !== -1) next[fromSlot] = null;
        const displaced = next[slotIndex];
        if (displaced && displaced.id !== letterId) {
          setTray((t) => [...t, displaced]);
        }
        next[slotIndex] = letter;
        return next;
      });
    },
    handleDropTray: (letterId) => {
      const fromSlot = slots.findIndex((item) => item?.id === letterId);
      if (fromSlot === -1) return;
      setSlots((prev) => {
        const next = [...prev];
        const letter = next[fromSlot];
        next[fromSlot] = null;
        if (letter) setTray((t) => [...t, letter]);
        return next;
      });
    },
    repeat,
    repeatInstruction,
    replayWord: () => currentWord && speakWord(currentWord.word, { interrupt: true }),
  };
}
