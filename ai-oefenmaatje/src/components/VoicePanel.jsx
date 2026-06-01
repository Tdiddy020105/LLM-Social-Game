import { getLastTtsError } from "../services/speech.js";

export default function VoicePanel({
  message,
  loading,
  onRepeat,
  compact = false,
  minimal = false,
}) {
  const ttsError = getLastTtsError();

  if (minimal) {
    return (
      <div className="voice-mini" aria-live="polite">
        {message && (
          <button
            type="button"
            className="btn btn--ghost btn--compact"
            onClick={onRepeat}
            title="Herhaal"
          >
            ↻
          </button>
        )}
        {ttsError && <span className="voice-error">{ttsError}</span>}
      </div>
    );
  }

  return (
    <section
      className={`voice-panel ${compact ? "voice-panel--compact" : ""}`}
      aria-live="polite"
    >
      <p className="voice-message">
        {loading ? "…" : message || ""}
      </p>
      {message && !loading && onRepeat && (
        <button type="button" className="btn btn--ghost btn--compact" onClick={onRepeat}>
          ↻
        </button>
      )}
      {ttsError && <p className="voice-error">{ttsError}</p>}
    </section>
  );
}
