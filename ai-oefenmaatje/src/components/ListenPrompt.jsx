import { LISTEN_PROMPT_LINE } from "../lib/lessonScript.js";

export default function ListenPrompt() {
  return (
    <div className="listen-prompt listen-prompt--compact" aria-label="Luister naar het woord">
      <p className="listen-prompt__text">{LISTEN_PROMPT_LINE.line}</p>
    </div>
  );
}
