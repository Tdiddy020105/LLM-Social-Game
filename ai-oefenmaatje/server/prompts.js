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
    task_explain:
      "Leg in één zin uit wat het kind moet doen volgens de opdracht (blok-zien, patroon-kiezen, blok-horen of woord-typen).",
    reflect_certain: 'Vraag rustig: "Ben je zeker?"',
    feedback_correct:
      'Proces-feedback, bijvoorbeeld: "Mooi. Je hebt goed geoefend."',
    feedback_wrong:
      mistakeCount === 1
        ? 'Zeg: "Bijna. Probeer het nog eens."'
        : mistakeCount === 2
          ? "Geef een korte hint zonder het antwoord weg te geven."
          : "Stel gerust: even rustig, daarna opnieuw proberen.",
    confidence_start:
      "Stel gerust: even iets makkelijks om vertrouwen te krijgen.",
    session_end:
      "Bedank het kind. Zeg dat de ouder nog vragen invult.",
  };

  if (instructions[phase]) {
    parts.push(`Instructie: ${instructions[phase]}`);
  }
  return parts.join("\n");
}

export function getFallback(context) {
  return getLessonFallback(context);
}
