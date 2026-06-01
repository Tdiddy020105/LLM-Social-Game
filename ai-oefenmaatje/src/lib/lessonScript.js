/** One line for screen + voice (prevents saying/showing two versions) */

export const PARENT_LANDING = {
  title: "Voor ouder of begeleider",
  steps: [
    "Lees dit scherm even. Uw kind hoeft dit niet te lezen.",
    "Klik op Start als uw kind klaar is. De oefenmaatje spreekt dan uw kind toe.",
    "Blijf in de buurt: helpen mag, maar laat uw kind eerst zelf proberen.",
    "Na afloop: vul de enquête in die u per e-mail ontving.",
  ],
};

export const KID_INTRO_LINE = {
  line: "Hoi! Ik ben je oefenmaatje. Ik help jou met woorden oefenen. Luister goed. Fouten mogen. Kies straks wat bij jou past.",
};

export const DIFFICULTY_LINE = {
  line: "Kies makkelijk, normaal of moeilijk.",
};

export const BLOCK_LEGEND_LINE = {
  line: "Wit is klinker, rood is medeklinker. Zet de blokjes in de volgorde van het woord.",
};

export function taskHint(taskType) {
  if (taskType === "klinker-detective") {
    return {
      line: "Luister naar het woord. Kies de klinker in het midden. Onder de smiley kun je het woord nog eens horen.",
    };
  }
  if (taskType === "blok-puzzel") {
    return {
      line: "Luister en zet wit en rood in de goede volgorde.",
    };
  }
  return { line: "Laten we verder gaan." };
}

export function levelHint() {
  return { line: "Goed bezig! Nu de blok-puzzel met hetzelfde woord." };
}

export function feedbackLine(correct, mistakeCount) {
  if (correct) return { line: "Goed gedaan!" };
  if (mistakeCount >= 3) {
    return { line: "Even rustig. Daarna proberen we opnieuw." };
  }
  if (mistakeCount === 2) {
    return { line: "Bijna! Luister nog een keer." };
  }
  return { line: "Probeer het nog een keer." };
}

export const REFLECT_LINE = {
  line: "Ben je zeker van je antwoord? Kies hieronder.",
};

export const CONFIDENCE_LINE = {
  line: "Even rustig. Klik als je verder wilt.",
};

export const SESSION_END_KID = {
  line: "Super gedaan! Tot de volgende keer!",
};

export const SESSION_END_PARENT_NOTE =
  "Voor ouder: vul de enquête in die je per e-mail ontving.";
