import { getLastProviderUsed, getLastTtsError } from "../services/speech.js";

export default function VoicePanel({
  message,
  loading,
  onRepeat,
  aiSource,
  voiceName,
}) {
  const ttsLabel =
    getLastProviderUsed() === "elevenlabs"
      ? "ElevenLabs"
      : getLastProviderUsed() === "browser"
        ? "browser"
        : getLastProviderUsed();

  const ttsError = getLastTtsError();

  return (
    <section className="voice-panel" aria-live="polite">
      <div className="voice-orb" aria-hidden="true">
        <span className={loading ? "voice-orb__pulse" : ""} />
      </div>
      <p className="voice-label">
        AI-oefenmaatje
        {aiSource && <span className="voice-source"> · {aiSource}</span>}
        <span className="voice-source">
          {" "}
          · stem: {voiceName || ttsLabel}
        </span>
      </p>
      <p className="voice-message">
        {loading ? "Even nadenken…" : message || "Luister naar je oefenmaatje…"}
      </p>
      {ttsError && ttsLabel === "browser" && (
        <p className="voice-error">{ttsError}</p>
      )}
      {message && !loading && (
        <button type="button" className="btn btn--ghost" onClick={onRepeat}>
          Herhaal zin
        </button>
      )}
    </section>
  );
}
