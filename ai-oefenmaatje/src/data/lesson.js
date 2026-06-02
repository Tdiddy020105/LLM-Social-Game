import { WORDS, buildLettersFromSpelling, buildTray, emptySlots, shuffle } from "./words.js";

export const DIFFICULTIES = [
  { id: "makkelijk", label: "Makkelijk" },
  { id: "normaal", label: "Normaal" },
  { id: "moeilijk", label: "Moeilijk" },
];

export const TASK_TYPES = [
  { id: "klinker-detective", label: "Klinker-speurder", order: 0 },
  { id: "blok-puzzel", label: "Blok-puzzel", order: 1 },
];

export const LAST_TASK_TYPE = "blok-puzzel";

const WORDS_BY_DIFFICULTY = {
  makkelijk: ["vis", "tak", "maan"],
  normaal: ["boom", "maan", "vis"],
  moeilijk: ["raam", "boom", "maan"],
};

export const FAVORITE_BLOCKS = [
  { id: "fav-b", text: "b", type: "consonant" },
  { id: "fav-oo", text: "oo", type: "vowel" },
  { id: "fav-m", text: "m", type: "consonant" },
  { id: "fav-a", text: "a", type: "vowel" },
];

export function getWordData(word) {
  const entry = WORDS.find((w) => w.word === word);
  if (!entry) return undefined;
  return {
    ...entry,
    letters: buildLettersFromSpelling(entry.word),
  };
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

/** Syllable chunks for paced Dutch TTS (e.g. ["b", "oo", "m"]) */
export function wordSyllables(word) {
  const data = getWordData(word);
  if (!data) return [word];
  return data.letters.map((l) => l.text);
}

/** Natural Dutch sentence — whole word, same voice as the maatje (not letter-by-letter). */
export function wordTtsText(word) {
  return `Het woord is ${word}.`;
}

/** Replace target word(s) in on-screen text so kids must listen, not read. */
export function maskWordInText(text, words) {
  if (!text || !words?.length) return text;
  let result = text;
  for (const word of words) {
    if (!word) continue;
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(new RegExp(escaped, "gi"), "#".repeat(word.length));
  }
  return result;
}

/** Short Dutch word so TTS says the klinker as in real spelling (not letter-by-letter). */
const VOWEL_KLANKWOORD = {
  a: "tak",
  aa: "maan",
  e: "bed",
  ee: "neef",
  i: "vis",
  ie: "zien",
  o: "bot",
  oo: "boom",
};

export function vowelSpeakText(grapheme) {
  return VOWEL_KLANKWOORD[grapheme] ?? grapheme;
}

/** Drag puzzle: correct when red/white order matches the word's klinker/medeklinker pattern. */
export function dragPatternMatches(slots, wordData) {
  if (!wordData?.letters?.length) return false;
  const pattern = wordData.letters.map((l) => l.type);
  const attempt = slots.map((s) => s?.type ?? null);
  return (
    attempt.length === pattern.length &&
    pattern.every((type, i) => attempt[i] === type)
  );
}

export function initDragState(word) {
  const data = getWordData(word);
  if (!data) return { tray: [], slots: [] };
  const letters = data.letters;
  return {
    tray: buildTray(letters),
    slots: emptySlots(letters.length),
  };
}

export { shuffle };
