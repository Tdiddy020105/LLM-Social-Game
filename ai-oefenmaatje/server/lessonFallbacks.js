/** Server fallbacks — kept in sync with src/lib/lessonScript.js + lessonFallbacks.js */

const LINES = {
  difficulty_ask: "Kies makkelijk, normaal of moeilijk.",
  reflect_certain: "Ben je zeker van je antwoord? Kies hieronder.",
  task_klinker: "Luister naar het woord. Kies de klinker in het midden.",
  task_blok:
    "Luister naar het woord. Sleep de blokjes in de vakjes. Wit en rood, van links naar rechts.",
  level_up: "Goed gedaan! Nu de blok-puzzel met hetzelfde woord.",
  feedback_correct: "Goed gedaan!",
  feedback_wrong_1: "Bijna. Luister nog eens goed naar het midden van het woord.",
  feedback_wrong_2: "Bijna! Luister nog een keer.",
  feedback_wrong_3: "Even rustig. Daarna proberen we opnieuw.",
  confidence_start: "Even rustig. Daarna proberen we opnieuw.",
  session_end: "Super gedaan! Tot de volgende keer!",
};

export function getLessonFallback(context) {
  const { phase, taskType, mistakeCount } = context;

  if (phase === "task_explain") {
    if (taskType === "klinker-detective") return LINES.task_klinker;
    if (taskType === "blok-puzzel") return LINES.task_blok;
  }
  if (phase === "level_up") return LINES.level_up;
  if (phase === "feedback_correct") return LINES.feedback_correct;
  if (phase === "feedback_wrong" && mistakeCount) {
    const key = `feedback_wrong_${Math.min(mistakeCount, 3)}`;
    if (LINES[key]) return LINES[key];
  }
  if (phase === "confidence_start") return LINES.confidence_start;
  if (phase === "session_end") return LINES.session_end;
  if (phase === "difficulty_ask") return LINES.difficulty_ask;
  if (phase === "reflect_certain") return LINES.reflect_certain;

  return "Laten we verder gaan.";
}
