import { useState } from "react";
import "./App.css";

const words = [
  {
    word: "boom",
    instruction: "Maak het woord boom met de blokjes.",
    hint: "B - oo - m. De oo-klank zit in het midden.",
  },
  {
    word: "maan",
    instruction: "Maak het woord maan met de blokjes.",
    hint: "M - aa - n. Let op de lange aa-klank.",
  },
  {
    word: "vis",
    instruction: "Maak het woord vis met de blokjes.",
    hint: "V - i - s. Een kort woord met één klinker.",
  },
];

const responses = {
  correct: [
    "Goed gedaan. Het woord klopt.",
    "Ja, dat is goed gespeld.",
    "Mooi. Je hebt de klanken goed neergelegd.",
  ],
  wrong: [
    "Bijna. Kijk nog eens naar de klinker.",
    "Nog niet helemaal. Luister nog eens naar het woord.",
    "Probeer het rustig opnieuw. Begin bij de eerste klank.",
  ],
  frustrated: [
    "Dat is niet erg. We doen het stap voor stap.",
    "Deze is lastig. Neem even de tijd.",
    "Goed dat je blijft proberen. We maken het samen kleiner.",
  ],
  hint: [
    "Rood is voor medeklinkers. Wit is voor klinkers.",
    "Leg het woord van links naar rechts neer.",
    "Luister eerst naar de eerste klank. Daarna naar de klinker.",
  ],
};

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export default function App() {
  const [wordIndex, setWordIndex] = useState(0);
  const [message, setMessage] = useState(
    "Hoi. Ik help je vandaag met woorden bouwen."
  );
  const [lastAction, setLastAction] = useState("Klaar om te starten");

  const current = words[wordIndex];

  function speak(text, action = "") {
    setMessage(text);
    if (action) setLastAction(action);

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "nl-NL";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
  }

  function start() {
    speak(current.instruction, "Oefening gestart");
  }

  function nextWord() {
    const next = (wordIndex + 1) % words.length;
    setWordIndex(next);
    speak(words[next].instruction, "Nieuw woord");
  }

  return (
    <div className="page">
      <section className="stage">
        <div className="topbar">
          <div>
            <p className="eyebrow">Prototype</p>
            <h1>Oefenmaatje</h1>
          </div>
          <span className="status">{lastAction}</span>
        </div>

        <div className="voice-panel">
          <div className="orb">
            <span />
          </div>

          <p className="speaker-label">AI-stem</p>
          <p className="message">“{message}”</p>

          <button className="ghost-button" onClick={() => speak(message)}>
            Herhaal zin
          </button>
        </div>

        <div className="task-grid">
          <div className="task-card">
            <p className="label">Woord</p>
            <h2>{current.word}</h2>
            <p className="hint">{current.hint}</p>
          </div>

          <div className="block-card">
            <p className="label">Blokjes</p>

            <div className="legend-row">
              <div className="lego red-lego" />
              <div>
                <strong>Rood</strong>
                <p>medeklinker</p>
              </div>
            </div>

            <div className="legend-row">
              <div className="lego white-lego" />
              <div>
                <strong>Wit</strong>
                <p>klinker</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside className="operator">
        <p className="eyebrow">Verborgen bediening</p>
        <h2>Wizard-of-Oz</h2>
        <p className="operator-text">
          Deze knoppen simuleren de camera. Tijdens een test ziet het kind dit
          paneel niet.
        </p>

        <div className="button-list">
          <button onClick={start}>Start oefening</button>
          <button onClick={() => speak(pick(responses.correct), "Goed")}>
            Antwoord is goed
          </button>
          <button onClick={() => speak(pick(responses.wrong), "Fout")}>
            Antwoord is fout
          </button>
          <button
            onClick={() => speak(pick(responses.frustrated), "Frustratie")}
          >
            Kind is gefrustreerd
          </button>
          <button onClick={() => speak(pick(responses.hint), "Hint gegeven")}>
            Geef hint
          </button>
          <button onClick={nextWord}>Volgend woord</button>
        </div>

        <div className="boundary-box">
          <h3>Rol van de AI</h3>
          <ul>
            <li>begeleidt de oefening</li>
            <li>geeft directe feedback</li>
            <li>bepaalt geen leerdoelen</li>
            <li>vervangt de leerkracht niet</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}