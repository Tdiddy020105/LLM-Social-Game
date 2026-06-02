/** Single source of truth — every spoken line is also the on-screen caption (exact match). */

export const PARENT_LANDING = {
  title: "Voor ouder of begeleider",
  steps: [
    "Lees dit scherm even. Uw kind hoeft dit niet te lezen.",
    "Klik op Start als uw kind klaar is. Het oefenmaatje spreekt dan uw kind toe.",
    "Blijf in de buurt: helpen mag, maar laat uw kind eerst zelf proberen.",
    "Na afloop: vul de enquête in die u per e-mail ontving.",
  ],
};

export const KID_INTRO_LINE = {
  line: "Hoi! Ik ben je oefenmaatje. Ik help je met woorden oefenen. Luister goed. Fouten mogen. Kies straks wat bij je past.",
};

export const DIFFICULTY_LINE = {
  line: "Kies makkelijk, normaal of moeilijk.",
};

export const LISTEN_PROMPT_LINE = {
  line: "Luister goed. Het woord staat niet op je scherm.",
};

export const BLOCK_LEGEND_LINE = {
  line: "Wit is klinker, rood is medeklinker. Sleep elk blokje naar een vakje erboven. Van links naar rechts, net als het woord dat je hoort.",
};

export function taskHint(taskType) {
  if (taskType === "klinker-detective") {
    return {
      line: "Luister naar het woord. Kies de klinker in het midden.",
    };
  }
  if (taskType === "blok-puzzel") {
    return {
      line: "Luister naar het woord. Sleep de blokjes in de vakjes. Wit en rood, van links naar rechts.",
    };
  }
  return { line: "Laten we verder gaan." };
}

export function levelHint() {
  return { line: "Goed gedaan! Nu de blok-puzzel met hetzelfde woord." };
}

export function feedbackLine(correct, mistakeCount) {
  if (correct) return { line: "Goed gedaan!" };
  if (mistakeCount >= 3) {
    return { line: "Even rustig. Daarna proberen we opnieuw." };
  }
  if (mistakeCount === 2) {
    return { line: "Bijna! Luister nog een keer." };
  }
  return { line: "Bijna. Luister nog eens goed naar het midden van het woord." };
}

export const REFLECT_LINE = {
  line: "Ben je zeker van je antwoord? Kies hieronder.",
};

export const CONFIDENCE_LINE = {
  line: "Even rustig. Klik op verder als je klaar bent.",
};

export const SESSION_END_KID = {
  line: "Super gedaan! Tot de volgende keer!",
};

export const SESSION_END_PARENT_NOTE =
  "Voor ouder: vul de enquête in die je per e-mail ontving.";

/** Visual-only helper under the buddy caption — not spoken separately. */
export function puzzleSlotLabel(blockCount) {
  return `${blockCount} ${blockCount === 1 ? "vakje" : "vakjes"} — van links naar rechts`;
}
