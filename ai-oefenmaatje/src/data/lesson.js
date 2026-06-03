import { WORDS, buildLettersFromSpelling, buildTrayWithExtras, emptySlots, shuffle } from "./words.js";

export const DIFFICULTIES = [
  { id: "makkelijk", label: "Makkelijk" },
  { id: "normaal", label: "Normaal" },
  { id: "moeilijk", label: "Moeilijk" },
];

/** Margit: makkelijk = zien+blokjes, normaal = horen+patroon, moeilijk = horen+blokjes */
export const TASK_TYPES = [
  { id: "blok-zien", label: "Blokjes leggen" },
  { id: "patroon-kiezen", label: "Patroon kiezen" },
  { id: "blok-horen", label: "Blokjes leggen" },
  { id: "woord-typen", label: "Woord typen" },
];

export const TASK_BY_DIFFICULTY = {
  makkelijk: "blok-zien",
  normaal: "patroon-kiezen",
  moeilijk: "blok-horen",
};

const WORDS_BY_DIFFICULTY = {
  makkelijk: ["vis", "tak", "maan"],
  normaal: ["vis", "tak", "maan"],
  moeilijk: ["boom", "maan", "raam"],
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
    if (options.length >= 3) break;
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

/** Makkelijk: woord zichtbaar → aantal blokjes mag getoond. Luister-niveaus: niet verraden. */
export function showsBlockCount(difficulty) {
  return difficulty === "makkelijk";
}

/** Makkelijk: woord + plaatje op scherm. Normaal/moeilijk: alleen plaatje. */
export function showsWordText(difficulty) {
  return difficulty === "makkelijk";
}

export function showsImage() {
  return true;
}

export function wordTtsPhrase(word, difficulty) {
  if (showsWordText(difficulty)) {
    return `Het woord is ${word}.`;
  }
  return word;
}

/** Used by speech repeat fallback. */
export function wordTtsText(word) {
  return word;
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

function filledTypesInOrder(slots) {
  return slots.filter(Boolean).map((s) => s.type);
}

export { filledTypesInOrder };

export function dragPatternMatches(slots, wordData, taskType = "blok-zien") {
  if (!wordData?.letters?.length) return false;
  const pattern = wordPattern(wordData);

  if (taskType === "blok-horen") {
    const attempt = filledTypesInOrder(slots);
    if (attempt.length !== pattern.length) return false;
    return pattern.every((type, i) => attempt[i] === type);
  }

  const required = pattern.length;
  const attempt = slots.slice(0, required).map((s) => s?.type ?? null);
  if (!attempt.every(Boolean)) return false;
  return pattern.every((type, i) => attempt[i] === type);
}

export function typedWordMatches(input, word) {
  return input.trim().toLowerCase() === word.toLowerCase();
}

/** Makkelijk: exact vakjes. Moeilijk: extra vakjes rechts (kind vult alleen wat nodig is). */
export function slotCountForDrag(wordLength, taskType) {
  if (taskType === "blok-horen") {
    return wordLength + Math.max(2, Math.ceil(wordLength / 2));
  }
  return wordLength;
}

export function dragCanSubmit(slots, wordData, taskType) {
  if (!wordData?.letters?.length || !slots.length) return false;
  const required = wordData.letters.length;
  const filledCount = slots.filter(Boolean).length;

  if (taskType === "blok-zien") {
    return slots.length === required && filledCount === required;
  }

  return filledCount === required;
}

export function initDragState(word, taskType = "blok-zien") {
  const data = getWordData(word);
  if (!data) return { tray: [], slots: [] };
  const letters = data.letters;
  const slotCount = slotCountForDrag(letters.length, taskType);
  return {
    tray: buildTrayWithExtras(word, letters),
    slots: emptySlots(slotCount),
  };
}

export { shuffle };
