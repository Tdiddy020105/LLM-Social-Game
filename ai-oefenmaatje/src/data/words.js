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
    word: "vis",
    image: "/words/vis.svg",
  },
  {
    word: "tak",
    image: "/words/tak.svg",
  },
  {
    word: "maan",
    image: "/words/maan.svg",
  },
  {
    word: "boom",
    image: "/words/boom.svg",
  },
  {
    word: "raam",
    image: "/words/raam.svg",
  },
];

export const WORDS = WORD_DEFS.map((def) => ({
  ...def,
  letters: buildLettersFromSpelling(def.word),
}));

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
