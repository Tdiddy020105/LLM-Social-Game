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

export function taskHint(taskType) {
  if (taskType === "blok-zien") {
    return {
      line: "Kijk naar het woord en het plaatje. Leg de blokjes eronder. Wit is een klinker, blauw is een medeklinker.",
    };
  }
  if (taskType === "patroon-kiezen") {
    return {
      line: "Luister naar het woord. Kies het patroon dat bij het woord hoort.",
    };
  }
  if (taskType === "blok-horen") {
    return {
      line: "Luister naar het woord. Leg de klinker- en medeklinkerblokjes. Volgorde telt.",
    };
  }
  if (taskType === "woord-typen") {
    return { line: "Typ het woord dat je net hebt gehoord." };
  }
  return { line: "Laten we verder gaan." };
}

export function feedbackLine(correct, mistakeCount, taskType) {
  if (correct) return { line: "Goed gedaan!" };
  if (mistakeCount >= 3) {
    return { line: "Even rustig. Daarna proberen we opnieuw." };
  }
  if (taskType === "woord-typen") {
    return { line: "Bijna. Probeer het nog een keer." };
  }
  if (mistakeCount === 2) return { line: "Bijna! Luister nog een keer." };
  return { line: "Bijna. Probeer het nog eens." };
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

export function puzzleSlotLabel(blockCount, { flexible = false, hideCount = false } = {}) {
  if (hideCount) {
    return flexible
      ? "Leg de blokjes — volgorde telt. Tik om terug te leggen."
      : "Leg de blokjes — van links naar rechts";
  }
  if (flexible) {
    return `${blockCount} vakjes — volgorde telt`;
  }
  return `${blockCount} ${blockCount === 1 ? "vakje" : "vakjes"} — van links naar rechts`;
}

export function moeilijkStepLabel(subStep) {
  return subStep === "woord-typen" ? "Stap 2: typen" : "Stap 1: blokjes";
}
