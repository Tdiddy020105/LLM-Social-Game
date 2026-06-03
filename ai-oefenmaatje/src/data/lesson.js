import { WORDS, buildLettersFromSpelling, buildTray, emptySlots, shuffle } from "./words.js";

export const DIFFICULTIES = [
  { id: "makkelijk", label: "Makkelijk" },
  { id: "normaal", label: "Normaal" },
  { id: "moeilijk", label: "Moeilijk" },
];

export const TASK_TYPES = [
  { id: "blok-zien", label: "Woord bouwen", order: 0 },
  { id: "patroon-kiezen", label: "Patroon kiezen", order: 1 },
  { id: "blok-horen", label: "Blok-puzzel", order: 2 },
  { id: "woord-typen", label: "Woord typen", order: 3 },
];

export const TASK_BY_DIFFICULTY = {
  makkelijk: "blok-zien",
  normaal: "patroon-kiezen",
  moeilijk: "blok-horen",
};

const WORDS_BY_DIFFICULTY = {
  makkelijk: ["vis", "tak", "maan"],
  normaal: ["boom", "maan", "vis"],
  moeilijk: ["raam", "boom", "maan"],
};

export function getTaskForDifficulty(difficulty) {
  return TASK_BY_DIFFICULTY[difficulty] || "blok-zien";
}

export function isListenTask(taskType) {
  return taskType === "patroon-kiezen" || taskType === "blok-horen";
}

export function isDragTask(taskType) {
  return taskType === "blok-zien" || taskType === "blok-horen";
}

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

export function wordPattern(wordData) {
  if (!wordData?.letters?.length) return [];
  return wordData.letters.map((l) => l.type);
}

function patternKey(pattern) {
  return pattern.map((t) => (t === "vowel" ? "W" : "B")).join("");
}

function mutatePattern(pattern) {
  const next = [...pattern];
  const idx = Math.floor(Math.random() * next.length);
  next[idx] = next[idx] === "vowel" ? "consonant" : "vowel";
  return next;
}

function wrongLengthPattern(pattern) {
  if (pattern.length <= 2) return [...pattern, "vowel"];
  return pattern.slice(0, -1);
}

/** Pattern options for patroon-kiezen — each option is vowel/consonant[] */
export function getPatternOptions(wordData) {
  const correct = wordPattern(wordData);
  const correctKey = patternKey(correct);
  const seen = new Set([correctKey]);
  const options = [{ id: correctKey, pattern: correct }];

  const candidates = [
    mutatePattern(correct),
    mutatePattern(correct),
    wrongLengthPattern(correct),
    [...correct].reverse(),
  ];

  for (const candidate of candidates) {
    const key = patternKey(candidate);
    if (seen.has(key)) continue;
    seen.add(key);
    options.push({ id: key, pattern: candidate });
    if (options.length >= 4) break;
  }

  while (options.length < 3) {
    const extra = mutatePattern(correct);
    const key = patternKey(extra);
    if (!seen.has(key)) {
      seen.add(key);
      options.push({ id: key, pattern: extra });
    }
  }

  return shuffle(options);
}

export function patternMatches(selectedPattern, wordData) {
  if (!selectedPattern?.length || !wordData?.letters?.length) return false;
  const expected = wordPattern(wordData);
  return (
    selectedPattern.length === expected.length &&
    expected.every((type, i) => selectedPattern[i] === type)
  );
}

export function wordTtsText(word) {
  return `Het woord is ${word}.`;
}

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

export function dragPatternMatches(slots, wordData) {
  if (!wordData?.letters?.length) return false;
  const pattern = wordPattern(wordData);
  const attempt = slots.map((s) => s?.type ?? null);
  return (
    attempt.length === pattern.length &&
    pattern.every((type, i) => attempt[i] === type)
  );
}

export function dragSpellingMatches(slots, wordData) {
  if (!wordData?.letters?.length) return false;
  const expected = wordData.letters.map((l) => l.text.toLowerCase());
  const attempt = slots.map((s) => s?.text?.toLowerCase() ?? null);
  return (
    attempt.length === expected.length &&
    expected.every((char, i) => attempt[i] === char)
  );
}

export function normalizeTypedWord(text) {
  return text.trim().toLowerCase();
}

export function typedWordMatches(input, word) {
  return normalizeTypedWord(input) === word.toLowerCase();
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
