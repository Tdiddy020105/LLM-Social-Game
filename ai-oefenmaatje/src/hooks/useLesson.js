import { useCallback, useRef, useState } from "react";
import {
  LAST_TASK_TYPE,
  TASK_TYPES,
  buildWordQueue,
  dragPatternMatches,
  initDragState,
  vowelSpeakText,
  wordTtsText,
} from "../data/lesson.js";
import {
  BLOCK_LEGEND_LINE,
  CONFIDENCE_LINE,
  DIFFICULTY_LINE,
  KID_INTRO_LINE,
  REFLECT_LINE,
  levelHint,
  taskHint,
} from "../lib/lessonScript.js";
import { getLessonFallback } from "../lib/lessonFallbacks.js";
import { askCompanion } from "../services/ai.js";
import * as speech from "../services/speech.js";

function lineText(line) {
  if (typeof line === "string") return line;
  return line?.line || "";
}

function nextTaskType(current) {
  const order = TASK_TYPES.map((t) => t.id);
  const idx = order.indexOf(current);
  return idx < order.length - 1 ? order[idx + 1] : current;
}

function isDragTask(type) {
  return type === "blok-puzzel";
}

function fallbackForPhase(phase, taskType, { mistakeCount, correct } = {}) {
  return getLessonFallback({
    phase,
    taskType,
    mistakeCount,
    correct,
  });
}

export function useLesson({ aiEnabled = false } = {}) {
  const [step, setStep] = useState("difficulty");
  const [taskPhase, setTaskPhase] = useState("answer");
  const [caption, setCaption] = useState("");
  const [speaking, setSpeaking] = useState(false);

  const lastSpokenRef = useRef("");
  const lessonStartedRef = useRef(false);
  const blockLegendSpokenRef = useRef(false);

  const [difficulty, setDifficulty] = useState(null);
  const [taskType, setTaskType] = useState("klinker-detective");
  const [wordQueue, setWordQueue] = useState([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [correctStreak, setCorrectStreak] = useState(0);

  const [vowelChoice, setVowelChoice] = useState(null);
  const [tray, setTray] = useState([]);
  const [slots, setSlots] = useState([]);

  const [pendingLevelUp, setPendingLevelUp] = useState(false);

  const currentWord = wordQueue[wordIndex];
  const taskMeta = TASK_TYPES.find((t) => t.id === taskType);

  const speakCaption = useCallback(async (text, { interrupt = false } = {}) => {
    const line = text?.trim();
    if (!line) return;
    lastSpokenRef.current = line;
    setCaption(line);
    setSpeaking(true);
    await speech.speakAndWait(line, { interrupt });
    setSpeaking(false);
  }, []);

  const speakWord = useCallback(
    async (word, { interrupt = false } = {}) => {
      if (!word) return;
      const phrase = wordTtsText(word);
      await speakCaption(phrase, { interrupt });
    },
    [speakCaption]
  );

  const buildContext = useCallback(
    (phase, extra = {}) => {
      const hideWord =
        taskType === "klinker-detective" &&
        (taskPhase === "answer" || phase === "feedback_wrong");
      const includeVowel =
        phase !== "feedback_wrong" || taskType !== "klinker-detective";

      return {
        phase,
        taskType,
        difficulty,
        word: currentWord?.word,
        vowel: includeVowel ? currentWord?.vowel : undefined,
        hideWord,
        mistakeCount: extra.mistakeCount ?? mistakeCount,
        correctStreak,
        correct: extra.correct,
      };
    },
    [taskType, taskPhase, difficulty, currentWord, mistakeCount, correctStreak]
  );

  /** Gemini for feedback; scripted fallback if offline or no API key. */
  const sayPhase = useCallback(
    async (phase, extra = {}, { interrupt = false } = {}) => {
      const fallback = fallbackForPhase(phase, taskType, extra);

      if (!aiEnabled) {
        await speakCaption(fallback, { interrupt });
        return;
      }

      try {
        const { text } = await askCompanion(buildContext(phase, extra));
        await speakCaption(text?.trim() || fallback, { interrupt });
      } catch {
        await speakCaption(fallback, { interrupt });
      }
    },
    [aiEnabled, buildContext, speakCaption, taskType]
  );

  const resetTaskUI = useCallback((word) => {
    setVowelChoice(null);
    setMistakeCount(0);
    setTaskPhase("answer");
    const drag = initDragState(word.word);
    setTray(drag.tray);
    setSlots(drag.slots);
  }, []);

  const resetLesson = useCallback(() => {
    lessonStartedRef.current = false;
    blockLegendSpokenRef.current = false;
    setStep("difficulty");
    setTaskPhase("answer");
    setCaption("");
    setSpeaking(false);
    setDifficulty(null);
    setTaskType("klinker-detective");
    setWordQueue([]);
    setWordIndex(0);
    setMistakeCount(0);
    setCorrectStreak(0);
    setVowelChoice(null);
    setTray([]);
    setSlots([]);
    setPendingLevelUp(false);
  }, []);

  const startLesson = useCallback(async () => {
    if (lessonStartedRef.current) return;
    lessonStartedRef.current = true;
    setStep("difficulty");
    await speakCaption(KID_INTRO_LINE.line, { interrupt: true });
    await speakCaption(DIFFICULTY_LINE.line);
  }, [speakCaption]);

  const pickDifficulty = useCallback(
    async (level) => {
      const queue = buildWordQueue(level);
      const first = queue[0];
      setDifficulty(level);
      setWordQueue(queue);
      setWordIndex(0);
      setTaskType("klinker-detective");
      setCorrectStreak(0);
      setPendingLevelUp(false);
      resetTaskUI(first);
      setStep("task");
      await speakCaption(lineText(taskHint("klinker-detective")));
      await speakWord(first.word);
    },
    [resetTaskUI, speakCaption, speakWord]
  );

  const startConfidenceBreak = useCallback(async () => {
    setStep("confidence");
    await speakCaption(CONFIDENCE_LINE.line);
  }, [speakCaption]);

  const checkAnswer = useCallback(async () => {
    if (!currentWord) return;

    let correct = false;
    if (taskType === "klinker-detective") {
      correct = vowelChoice === currentWord.vowel;
    } else if (isDragTask(taskType)) {
      correct = dragPatternMatches(slots, currentWord);
    }

    if (correct) {
      setTaskPhase("feedback");
      const streak = correctStreak + 1;
      setCorrectStreak(streak);
      await sayPhase("feedback_correct", { correct: true });
      if (streak >= 2 && taskType !== LAST_TASK_TYPE) {
        setPendingLevelUp(true);
      }
      return;
    }

    const nextMistake = mistakeCount + 1;
    setMistakeCount(nextMistake);
    setCorrectStreak(0);

    if (nextMistake >= 3) {
      await sayPhase("confidence_start", { correct: false, mistakeCount: 3 });
      await startConfidenceBreak();
      return;
    }

    await sayPhase("feedback_wrong", { correct: false, mistakeCount: nextMistake });
    await speakWord(currentWord.word);
    setTaskPhase("answer");
    if (taskType === "klinker-detective") {
      setVowelChoice(null);
    }
  }, [
    taskType,
    vowelChoice,
    slots,
    currentWord,
    mistakeCount,
    correctStreak,
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
    setVowelChoice(null);
  }, []);

  const finishConfidence = useCallback(async () => {
    setStep("task");
    setMistakeCount(0);
    resetTaskUI(currentWord);
    await speakCaption(lineText(taskHint(taskType)));
    await speakWord(currentWord.word);
  }, [currentWord, taskType, resetTaskUI, speakCaption, speakWord]);

  const advanceWord = useCallback(async () => {
    if (pendingLevelUp) {
      setPendingLevelUp(false);
      const nextType = nextTaskType(taskType);
      const wordData = wordQueue[wordIndex];
      setTaskType(nextType);
      resetTaskUI(wordData);
      if (isDragTask(nextType) && !blockLegendSpokenRef.current) {
        blockLegendSpokenRef.current = true;
        await speakCaption(BLOCK_LEGEND_LINE.line);
      }
      await speakCaption(lineText(levelHint()));
      await speakWord(wordData.word);
      return;
    }

    if (wordIndex >= wordQueue.length - 1) {
      setStep("lesson_done");
      await sayPhase("session_end");
      return;
    }

    const next = wordIndex + 1;
    const wordData = wordQueue[next];
    setWordIndex(next);
    resetTaskUI(wordData);
    await speakWord(wordData.word);
  }, [
    pendingLevelUp,
    taskType,
    wordIndex,
    wordQueue,
    resetTaskUI,
    sayPhase,
    speakWord,
  ]);

  const canSubmit =
    taskType === "klinker-detective"
      ? Boolean(vowelChoice)
      : slots.every(Boolean);

  const selectVowel = useCallback((grapheme) => {
    setVowelChoice(grapheme);
    if (grapheme) {
      speech.speakAndWait(vowelSpeakText(grapheme), { interrupt: true });
    }
  }, []);

  return {
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
    pendingLevelUp,
    canSubmit,
    resetLesson,
    startLesson,
    pickDifficulty,
    submitAnswer,
    keepAnswer,
    changeAnswer,
    finishConfidence,
    advanceWord,
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
    repeat: () => {
      if (lastSpokenRef.current) {
        return speech.repeatLast(lastSpokenRef.current);
      }
      return Promise.resolve();
    },
    replayWord: () => currentWord && speakWord(currentWord.word, { interrupt: true }),
  };
}
