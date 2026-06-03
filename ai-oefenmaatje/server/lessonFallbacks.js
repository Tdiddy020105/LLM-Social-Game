/** Server fallbacks — kept in sync with src/lib/lessonScript.js + lessonFallbacks.js */

const LINES = {
  difficulty_ask: "Kies makkelijk, normaal of moeilijk.",
  reflect_certain: "Ben je zeker van je antwoord? Kies hieronder.",
  task_blok_zien:
    "Kijk naar het woord en het plaatje. Leg de blokjes eronder. Wit is klinker, blauw is medeklinker.",
  task_patroon:
    "Luister naar het woord. Welk patroon hoort erbij? Blauw is medeklinker, wit is klinker.",
  task_blok_horen:
    "Luister naar het woord. Versleep de blokjes in de vakjes. Wit en blauw, van links naar rechts.",
  task_typen: "Typ het woord dat je net hebt gehoord.",
  feedback_correct: "Goed gedaan!",
  feedback_wrong_1: "Bijna. Probeer het nog eens.",
  feedback_wrong_2: "Bijna! Luister nog een keer.",
  feedback_wrong_3: "Even rustig. Daarna proberen we opnieuw.",
  confidence_start: "Even rustig. Daarna proberen we opnieuw.",
  session_end: "Super gedaan! Tot de volgende keer!",
};

export function getLessonFallback(context) {
  const { phase, taskType, mistakeCount } = context;

  if (phase === "task_explain") {
    if (taskType === "blok-zien") return LINES.task_blok_zien;
    if (taskType === "patroon-kiezen") return LINES.task_patroon;
    if (taskType === "blok-horen") return LINES.task_blok_horen;
    if (taskType === "woord-typen") return LINES.task_typen;
  }
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
