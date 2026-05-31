import { WORDS, buildTray, emptySlots, shuffle } from "./words.js";

export const SURVEY_QUESTIONS = [
  "Mijn kind begreep wat de bedoeling was.",
  "Mijn kind bleef betrokken.",
  "De feedback voelde helpend.",
  "De AI voelde als begeleiding.",
  "Mijn kind raakte gefrustreerd.",
];

export const DIFFICULTIES = [
  { id: "makkelijk", label: "Makkelijk" },
  { id: "normaal", label: "Normaal" },
  { id: "moeilijk", label: "Moeilijk" },
];

export const TASK_TYPES = [
  { id: "klinker-detective", label: "Klinker Detective", order: 0 },
  { id: "klank-volgorde", label: "Klank volgorde", order: 1 },
  { id: "woord-bouwen", label: "Woord bouwen", order: 2 },
];

const WORDS_BY_DIFFICULTY = {
  makkelijk: ["vis", "tak", "maan"],
  normaal: ["boom", "maan", "vis", "tak"],
  moeilijk: ["raam", "boom", "maan", "vis"],
};

export const FAVORITE_BLOCKS = [
  { id: "fav-b", text: "b", type: "consonant" },
  { id: "fav-oo", text: "oo", type: "vowel" },
  { id: "fav-m", text: "m", type: "consonant" },
  { id: "fav-a", text: "a", type: "vowel" },
];

export function getWordData(word) {
  return WORDS.find((w) => w.word === word);
}

export function buildWordQueue(difficulty) {
  const ids = WORDS_BY_DIFFICULTY[difficulty] || WORDS_BY_DIFFICULTY.normaal;
  return shuffle(ids.map((word) => getWordData(word)).filter(Boolean));
}

export function slowSpelling(word) {
  const data = getWordData(word);
  if (!data) return word;
  return data.letters.map((l) => l.text).join(" - ");
}

export function initDragState(word) {
  const data = getWordData(word);
  if (!data) return { tray: [], slots: [] };
  return {
    tray: buildTray(data.letters),
    slots: emptySlots(data.letters.length),
  };
}

export { shuffle };
