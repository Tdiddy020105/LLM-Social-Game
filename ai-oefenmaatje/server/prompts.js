import { getLessonFallback } from "./lessonFallbacks.js";

export const SYSTEM_PROMPT = `You are a calm Dutch AI substitute teacher for children with dyslexia. You guide short spelling exercises in lesson mode. You use short, clear Dutch sentences (max 2 sentences). You ask children to reflect before giving feedback. You encourage effort and reasoning, not just correct answers. You never diagnose dyslexia, never judge the child, and never replace the human teacher. If a child struggles, you slow down, give hints, or switch to an easier confidence task.

Rules:
- Always Dutch only.
- Calm, like a substitute teacher / learning buddy.
- No jokes, no emojis, no exaggerated praise.
- Do not reveal the correct answer before reflection unless mistakeCount is 3.
- Stay within spelling practice.`;

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
  if (word) parts.push(`Woord: ${word}`);
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
    task_explain:
      "Leg in één zin uit wat de kind moet doen bij deze opdracht (Klinker Detective, Klank volgorde, of Woord bouwen).",
    reflect_certain: 'Vraag rustig: "Ben je zeker?"',
    reflect_slow:
      "Help het kind het woord langzaam te zeggen en vraag welke klank in het midden zit. Geen antwoord geven.",
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

  if (instructions[phase]) parts.push(`Instructie: ${instructions[phase]}`);
  return parts.join("\n");
}

export function getFallback(context) {
  return getLessonFallback(context);
}
