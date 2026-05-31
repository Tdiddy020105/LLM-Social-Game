const MESSAGES = {
  lesson_intro:
    "Hoi, ik ben je oefenmaatje. We gaan samen woorden oefenen. Je hoeft het niet meteen goed te doen. We denken samen na.",
  difficulty_ask: "Wil je makkelijk, normaal of moeilijk beginnen?",
  task_klinker:
    "We spelen Klinker Detective. Luister naar het woord. Welke klinker zit in het midden?",
  task_klank: "Nu Klank volgorde. Zet de klanken in de goede volgorde.",
  task_woord: "Nu Woord bouwen. Sleep de blokjes om het woord te maken.",
  reflect_certain: "Ben je zeker?",
  reflect_slow_prefix: "Zeg het woord eens langzaam:",
  reflect_slow_suffix: "Welke klank hoor je in het midden?",
  feedback_correct:
    "Mooi. Je hebt goed geluisterd naar de klank in het woord.",
  feedback_wrong_1: "Bijna. Luister nog eens goed naar het midden van het woord.",
  feedback_wrong_2: "",
  feedback_wrong_3:
    "Dat is lastig. We doen eerst een makkelijke ronde en komen straks terug.",
  confidence_start:
    "Dat is niet erg. We doen even iets makkelijks om weer vertrouwen te krijgen.",
  confidence_done: "Goed. Je bent weer op gang. We proberen het vorige woord nog eens.",
  level_up: "Zullen we een stapje moeilijker proberen?",
  session_end:
    "Bedankt voor het oefenen. Je ouder mag nu even vragen invullen.",
};

export function getLessonFallback(context) {
  const { phase, word, mistakeCount, taskType } = context;

  if (phase === "reflect_slow" && word) {
    const slow = context.slowSpelling || word;
    return `${MESSAGES.reflect_slow_prefix} ${slow}. ${MESSAGES.reflect_slow_suffix}`;
  }

  if (phase === "feedback_wrong" && mistakeCount === 2 && word) {
    const v = context.vowel || "oo";
    return `De middelste klank klinkt als '${v}'. Kun je die vinden?`;
  }

  if (phase === "task_explain") {
    if (taskType === "klinker-detective") return MESSAGES.task_klinker;
    if (taskType === "klank-volgorde") return MESSAGES.task_klank;
    if (taskType === "woord-bouwen") return MESSAGES.task_woord;
  }

  if (phase === "feedback_wrong" && mistakeCount) {
    const key = `feedback_wrong_${Math.min(mistakeCount, 3)}`;
    if (MESSAGES[key]) return MESSAGES[key];
  }

  return MESSAGES[phase] || "Laten we verder gaan.";
}
