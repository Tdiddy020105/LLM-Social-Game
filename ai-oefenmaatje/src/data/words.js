export const GAMES = [
  {
    id: "woord-bouwen",
    title: "Woord bouwen",
    description: "Sleep blokjes om een gesproken woord te bouwen.",
  },
  {
    id: "klinker-zoeken",
    title: "Klinker zoeken",
    description: "Kies de juiste klinker bij het woord.",
  },
  {
    id: "klank-volgorde",
    title: "Klank volgorde",
    description: "Zet de klanken in de goede volgorde.",
  },
];

const VOWEL_LETTERS = new Set(["a", "e", "i", "o", "u"]);

function letterType(char) {
  return VOWEL_LETTERS.has(char.toLowerCase()) ? "vowel" : "consonant";
}

/** One lego block per spelling letter — boom → b, o, o, m (4 blocks). */
export function buildLettersFromSpelling(word) {
  const chars = word.split("");
  const totals = {};

  for (const char of chars) {
    const key = char.toLowerCase();
    totals[key] = (totals[key] ?? 0) + 1;
  }

  const seen = {};
  return chars.map((char) => {
    const key = char.toLowerCase();
    seen[key] = (seen[key] ?? 0) + 1;
    const idPart = totals[key] > 1 ? String(seen[key]) : key;

    return {
      id: `${word}-${idPart}`,
      text: char,
      type: letterType(char),
    };
  });
}

const WORD_DEFS = [
  {
    word: "boom",
    vowel: "oo",
    vowelOptions: ["oo", "o", "ee", "aa"],
  },
  {
    word: "maan",
    vowel: "aa",
    vowelOptions: ["aa", "a", "oo", "ee"],
  },
  {
    word: "vis",
    vowel: "i",
    vowelOptions: ["i", "ie", "ee", "a"],
  },
  {
    word: "raam",
    vowel: "aa",
    vowelOptions: ["aa", "a", "oo", "ee"],
  },
  {
    word: "tak",
    vowel: "a",
    vowelOptions: ["a", "aa", "o", "e"],
  },
];

export const WORDS = WORD_DEFS.map((def) => ({
  ...def,
  letters: buildLettersFromSpelling(def.word),
}));

export const EASY_WORDS = ["vis", "tak"];

export const FAVORITE_BLOCKS = [
  { id: "fav-b", text: "b", type: "consonant" },
  { id: "fav-oo", text: "oo", type: "vowel" },
  { id: "fav-m", text: "m", type: "consonant" },
  { id: "fav-a", text: "a", type: "vowel" },
];

export function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function buildTray(letters) {
  const vowelTotal = letters.filter((l) => l.type === "vowel").length;
  let vowelIndex = 0;

  return shuffle(
    letters.map((letter) => {
      if (letter.type !== "vowel") return { ...letter };

      vowelIndex += 1;
      return {
        ...letter,
        vowelOrdinal: vowelTotal > 1 ? vowelIndex : undefined,
      };
    })
  );
}

export function emptySlots(count) {
  return Array.from({ length: count }, () => null);
}
