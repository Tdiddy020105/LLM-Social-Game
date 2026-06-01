import { getLessonFallback } from "./lessonFallbacks.js";

export const SYSTEM_PROMPT = `Je bent een vriendelijke Nederlandse oefenmaatje voor kinderen van ongeveer 10 jaar met dyslexie. Je begeleidt korte spellingoefeningen. Gebruik korte, duidelijke zinnen (max 2). Vraag het kind eerst te reflecteren voordat je feedback geeft. Moedig inspanning en uitleg aan, niet alleen het goede antwoord. Je stelt nooit een diagnose en vervangt geen menselijke leraar.

Regels:
- Altijd alleen Nederlands.
- Warm en rustig, als een leerbuddy — niet streng.
- Licht enthousiasme mag ("lekker bezig", "goed geprobeerd"), geen overdreven hype of grappen.
- Noem het woord ALTIJD letterlijk (bijv. "boom"), nooit alleen "dit woord" of "het woord" zonder de letters.
- Geef het juiste antwoord niet weg vóór reflectie, tenzij mistakeCount 3 is.
- Blijf bij spellingoefening.`;

export function buildUserMessage(context) {
  const {
    phase,
    taskType,
    word,
    difficulty,
    correct,
    mistakeCount,
    correctStreak,
    sessionNote,
    vowel,
  } = context;

  const parts = [`Lesfase: ${phase}`];
  if (taskType) parts.push(`Opdracht: ${taskType}`);
  if (difficulty) parts.push(`Moeilijkheid: ${difficulty}`);
  if (word && !context.hideWord) parts.push(`Woord: ${word}`);
  if (vowel) parts.push(`Juiste klinker: ${vowel}`);
  if (typeof correct === "boolean") parts.push(`Klopt: ${correct}`);
  if (mistakeCount != null) parts.push(`Fouten dit woord: ${mistakeCount}`);
  if (correctStreak != null) parts.push(`Goede reeks: ${correctStreak}`);
  if (sessionNote) parts.push(`Notitie: ${sessionNote}`);

  const instructions = {
    lesson_intro:
      'Zeg tegen het kind: "Hoi, ik ben je oefenmaatje. We gaan samen woorden oefenen. Je hoeft het niet meteen goed te doen. We denken samen na."',
    difficulty_ask:
      'Vraag: "Wil je makkelijk, normaal of moeilijk beginnen?"',
    task_explain_klinker:
      "Leg in één zin uit: luister naar het woord (alleen audio, niet op het scherm) en kies de klinker in het midden. Noem het woord NIET in je antwoord.",
    task_explain:
      "Leg in één zin uit wat het kind moet doen. Noem het woord letterlijk. Bij klank-volgorde/woord-bouwen: zeg dat het woord op het scherm staat.",
    reflect_certain: 'Vraag rustig: "Ben je zeker?"',
    reflect_slow:
      "Vraag het kind het woord langzaam in gedachten te zeggen en welke klinker in het midden zit. Schrijf GEEN letters of klanken in je antwoord.",
    reflect_slow_klinker:
      "Zelfde als reflect_slow maar noem het woord niet en geef geen spelling.",
    feedback_correct:
      'Proces-feedback, bijvoorbeeld: "Mooi. Je hebt goed geluisterd naar de klank in het woord."',
    feedback_wrong:
      mistakeCount === 1
        ? 'Zeg: "Bijna. Luister nog eens goed naar het midden van het woord."'
        : mistakeCount === 2
          ? "Geef hint over de middelste klank zonder het hele woord te spellen."
          : 'Zeg dat het lastig is en dat jullie eerst een makkelijke ronde doen.',
    confidence_start:
      "Stel gerust: even iets makkelijks om vertrouwen te krijgen.",
    confidence_done:
      "Kort positief: weer op gang, daarna het vorige woord opnieuw.",
    level_up: 'Vraag: "Zullen we een stapje moeilijker proberen?"',
    session_end:
      "Bedank het kind. Zeg dat de ouder nog vragen invult.",
  };

  if (phase === "task_explain" && taskType === "klinker-detective") {
    parts.push(`Instructie: ${instructions.task_explain_klinker}`);
  } else if (phase === "reflect_slow" && taskType === "klinker-detective") {
    parts.push(`Instructie: ${instructions.reflect_slow_klinker}`);
  } else if (instructions[phase]) {
    parts.push(`Instructie: ${instructions[phase]}`);
  }
  return parts.join("\n");
}

export function getFallback(context) {
  return getLessonFallback(context);
}
