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

export const WORDS = [
  {
    word: "boom",
    vowel: "oo",
    letters: [
      { id: "boom-b", text: "b", type: "consonant" },
      { id: "boom-oo", text: "oo", type: "vowel" },
      { id: "boom-m", text: "m", type: "consonant" },
    ],
    vowelOptions: ["oo", "o", "ee", "aa"],
  },
  {
    word: "maan",
    vowel: "aa",
    letters: [
      { id: "maan-m", text: "m", type: "consonant" },
      { id: "maan-aa", text: "aa", type: "vowel" },
      { id: "maan-n", text: "n", type: "consonant" },
    ],
    vowelOptions: ["aa", "a", "oo", "ee"],
  },
  {
    word: "vis",
    vowel: "i",
    letters: [
      { id: "vis-v", text: "v", type: "consonant" },
      { id: "vis-i", text: "i", type: "vowel" },
      { id: "vis-s", text: "s", type: "consonant" },
    ],
    vowelOptions: ["i", "ie", "ee", "a"],
  },
  {
    word: "raam",
    vowel: "aa",
    letters: [
      { id: "raam-r", text: "r", type: "consonant" },
      { id: "raam-aa", text: "aa", type: "vowel" },
      { id: "raam-m", text: "m", type: "consonant" },
    ],
    vowelOptions: ["aa", "a", "oo", "ee"],
  },
  {
    word: "tak",
    vowel: "a",
    letters: [
      { id: "tak-t", text: "t", type: "consonant" },
      { id: "tak-a", text: "a", type: "vowel" },
      { id: "tak-k", text: "k", type: "consonant" },
    ],
    vowelOptions: ["a", "aa", "o", "e"],
  },
];

export const EASY_WORDS = ["vis", "tak"];

export const FAVORITE_BLOCKS = [
  { id: "fav-b", text: "b", type: "consonant" },
  { id: "fav-oo", text: "oo", type: "vowel" },
  { id: "fav-m", text: "m", type: "consonant" },
  { id: "fav-a", text: "a", type: "vowel" },
];

export const SURVEY_QUESTIONS = [
  "Mijn kind begreep wat de bedoeling was.",
  "Mijn kind bleef betrokken.",
  "De feedback voelde helpend.",
  "De stem voelde natuurlijk.",
  "Mijn kind raakte gefrustreerd.",
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
  return shuffle(letters.map((letter) => ({ ...letter })));
}

export function emptySlots(count) {
  return Array.from({ length: count }, () => null);
}
