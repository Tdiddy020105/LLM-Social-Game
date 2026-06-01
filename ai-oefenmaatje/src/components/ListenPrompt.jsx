export default function ListenPrompt({ onReplay }) {
  return (
    <div className="listen-prompt" aria-label="Luister naar het woord">
      <p className="listen-prompt__text">
        Luister goed. Het woord staat niet op je scherm.
      </p>
      <button type="button" className="btn btn--kid-secondary" onClick={onReplay}>
        Woord nog een keer horen
      </button>
    </div>
  );
}
