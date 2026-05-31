export default function StatusBadge({ config }) {
  if (!config) return null;

  const aiOk = config.ai;
  const ttsOk = config.tts?.hasExternalTts;

  return (
    <div className="status-badge" role="status">
      <span className={aiOk ? "status-badge__dot status-badge__dot--on" : "status-badge__dot"}>
        AI {aiOk ? "actief" : "offline"}
      </span>
      <span className={ttsOk ? "status-badge__dot status-badge__dot--on" : "status-badge__dot"}>
        Stem{" "}
        {ttsOk
          ? config.tts.voiceName
            ? `${config.tts.voiceName}`
            : config.tts.provider
          : "browser"}
      </span>
    </div>
  );
}
