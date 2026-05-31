import { useCallback, useState } from "react";
import {
  TASK_TYPES,
  buildWordQueue,
  getWordData,
  initDragState,
  slowSpelling,
} from "../data/lesson.js";
import { askCompanion } from "../services/ai.js";
import { getLessonFallback } from "../lib/lessonFallbacks.js";
import * as speech from "../services/speech.js";

function nextTaskType(current) {
  const order = TASK_TYPES.map((t) => t.id);
  const idx = order.indexOf(current);
  return idx < order.length - 1 ? order[idx + 1] : current;
}

export function useLesson() {
  const [step, setStep] = useState("ai_intro");
  const [taskPhase, setTaskPhase] = useState("answer");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState("");

  const [difficulty, setDifficulty] = useState(null);
  const [taskType, setTaskType] = useState("klinker-detective");
  const [wordQueue, setWordQueue] = useState([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);

  const [vowelChoice, setVowelChoice] = useState(null);
  const [tray, setTray] = useState([]);
  const [slots, setSlots] = useState([]);

  const [confidenceMode, setConfidenceMode] = useState(null);
  const [favoritePlaced, setFavoritePlaced] = useState(false);
  const [pendingLevelUp, setPendingLevelUp] = useState(false);
  const [retryAfterConfidence, setRetryAfterConfidence] = useState(false);

  const currentWord = wordQueue[wordIndex];
  const taskMeta = TASK_TYPES.find((t) => t.id === taskType);

  const aiSay = useCallback(async (context) => {
    setLoading(true);
    let result;
    try {
      result = await askCompanion(context);
    } catch {
      result = { text: getLessonFallback(context), source: "fallback" };
    }
    setMessage(result.text);
    setSource(result.source === "openai" ? "AI" : "offline");
    setLoading(false);
    await speech.speak(result.text);
    return result.text;
  }, []);

  const aiContext = useCallback(
    (overrides = {}) => ({
      phase: overrides.phase,
      taskType,
      difficulty,
      word: currentWord?.word,
      vowel: currentWord?.vowel,
      mistakeCount,
      correctStreak,
      slowSpelling: currentWord ? slowSpelling(currentWord.word) : "",
      ...overrides,
    }),
    [taskType, difficulty, currentWord, mistakeCount, correctStreak]
  );

  const resetTaskUI = useCallback((word) => {
    setVowelChoice(null);
    setMistakeCount(0);
    setTaskPhase("answer");
    const drag = initDragState(word.word);
    setTray(drag.tray);
    setSlots(drag.slots);
  }, []);

  const startLesson = useCallback(async () => {
    setStep("ai_intro");
    await aiSay(aiContext({ phase: "lesson_intro" }));
    setStep("difficulty");
    await aiSay(aiContext({ phase: "difficulty_ask" }));
  }, [aiSay, aiContext]);

  const pickDifficulty = useCallback(
    async (level) => {
      setDifficulty(level);
      const queue = buildWordQueue(level);
      setWordQueue(queue);
      setWordIndex(0);
      setTaskType("klinker-detective");
      setCorrectStreak(0);
      resetTaskUI(queue[0]);
      setStep("task");
      await aiSay(
        aiContext({ phase: "task_explain", taskType: "klinker-detective" })
      );
      await speech.speak(queue[0].word);
    },
    [aiSay, aiContext, resetTaskUI]
  );

  const startConfidenceBreak = useCallback(async () => {
    setRetryAfterConfidence(true);
    setConfidenceMode("choose");
    setStep("confidence");
    await aiSay(aiContext({ phase: "confidence_start" }));
  }, [aiSay, aiContext]);

  const checkAnswer = useCallback(
    async (parentForced) => {
      if (!currentWord) return;

      let correct = false;
      if (taskType === "klinker-detective") {
        correct = vowelChoice === currentWord.vowel;
      } else {
        const attempt = slots.map((s) => s?.text ?? "").join("");
        correct = attempt === currentWord.word;
      }

      if (parentForced === true) correct = true;
      if (parentForced === false) correct = false;

      if (correct) {
        setTaskPhase("feedback");
        const streak = correctStreak + 1;
        setCorrectStreak(streak);
        setTotalCorrect((n) => n + 1);
        await aiSay(aiContext({ phase: "feedback_correct", correct: true }));

        if (streak >= 2 && taskType !== "woord-bouwen") {
          setPendingLevelUp(true);
        }
        return;
      }

      const nextMistake = mistakeCount + 1;
      setMistakeCount(nextMistake);
      setCorrectStreak(0);

      if (nextMistake >= 3) {
        await aiSay(
          aiContext({ phase: "feedback_wrong", mistakeCount: 3, correct: false })
        );
        await startConfidenceBreak();
        return;
      }

      await aiSay(
        aiContext({
          phase: "feedback_wrong",
          mistakeCount: nextMistake,
          correct: false,
        })
      );
      setTaskPhase("answer");
      if (taskType === "klinker-detective") {
        setVowelChoice(null);
      }
    },
    [
      taskType,
      vowelChoice,
      slots,
      currentWord,
      mistakeCount,
      correctStreak,
      aiSay,
      aiContext,
      startConfidenceBreak,
    ]
  );

  const submitAnswer = useCallback(async () => {
    if (!currentWord) return;
    setTaskPhase("reflect_certain");
    await aiSay(aiContext({ phase: "reflect_certain" }));
    setTaskPhase("reflect_choice");
    await aiSay(
      aiContext({
        phase: "reflect_slow",
        slowSpelling: slowSpelling(currentWord.word),
      })
    );
  }, [aiSay, aiContext, currentWord]);

  const keepAnswer = useCallback(async () => {
    await checkAnswer(undefined);
  }, [checkAnswer]);

  const changeAnswer = useCallback(() => {
    setTaskPhase("answer");
    setVowelChoice(null);
  }, []);

  const finishConfidence = useCallback(async () => {
    setConfidenceMode(null);
    setFavoritePlaced(false);
    setStep("task");
    setMistakeCount(0);
    resetTaskUI(currentWord);
    await aiSay(aiContext({ phase: "confidence_done" }));
    await aiSay(aiContext({ phase: "task_explain", taskType }));
    if (taskType === "klinker-detective") {
      await speech.speak(currentWord.word);
    } else if (taskType !== "woord-bouwen") {
      await speech.speak(`Het woord is ${currentWord.word}.`);
    }
  }, [aiSay, aiContext, currentWord, taskType, resetTaskUI]);

  const advanceWord = useCallback(async () => {
    if (pendingLevelUp) {
      setPendingLevelUp(false);
      const nextType = nextTaskType(taskType);
      setTaskType(nextType);
      resetTaskUI(wordQueue[wordIndex]);
      await aiSay(aiContext({ phase: "level_up", taskType: nextType }));
      await aiSay(aiContext({ phase: "task_explain", taskType: nextType }));
      if (nextType === "klinker-detective") {
        await speech.speak(wordQueue[wordIndex].word);
      } else {
        await speech.speak(`Het woord is ${wordQueue[wordIndex].word}.`);
      }
      return false;
    }

    if (wordIndex >= wordQueue.length - 1) {
      setStep("lesson_done");
      await aiSay(aiContext({ phase: "session_end" }));
      return true;
    }

    const next = wordIndex + 1;
    setWordIndex(next);
    resetTaskUI(wordQueue[next]);
    if (taskType === "klinker-detective") {
      await speech.speak(wordQueue[next].word);
    } else {
      await speech.speak(`Het woord is ${wordQueue[next].word}.`);
    }
    return false;
  }, [
    pendingLevelUp,
    taskType,
    wordIndex,
    wordQueue,
    aiSay,
    aiContext,
    resetTaskUI,
  ]);

  const canSubmit =
    taskType === "klinker-detective"
      ? Boolean(vowelChoice)
      : slots.every(Boolean);

  return {
    step,
    taskPhase,
    message,
    loading,
    source,
    difficulty,
    taskType,
    taskMeta,
    currentWord,
    wordIndex,
    wordQueue,
    mistakeCount,
    correctStreak,
    totalCorrect,
    vowelChoice,
    setVowelChoice,
    tray,
    slots,
    confidenceMode,
    favoritePlaced,
    setFavoritePlaced,
    pendingLevelUp,
    setPendingLevelUp,
    canSubmit,
    startLesson,
    pickDifficulty,
    submitAnswer,
    keepAnswer,
    changeAnswer,
    checkAnswer,
    startConfidenceBreak,
    finishConfidence,
    advanceWord,
    setConfidenceMode,
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
    repeat: () => message && speech.repeat(message),
    replayWord: () => currentWord && speech.speak(currentWord.word),
  };
}
