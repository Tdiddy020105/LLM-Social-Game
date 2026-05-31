import { useCallback, useState } from "react";
import { askCompanion } from "../services/ai.js";
import * as speech from "../services/speech.js";

export function useCompanion() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState("");

  const say = useCallback(async (context) => {
    setLoading(true);
    const result = await askCompanion(context);
    setMessage(result.text);
    setSource(result.source === "openai" ? "AI" : "offline");
    setLoading(false);
    await speech.speak(result.text);
    return result.text;
  }, []);

  const repeat = useCallback(() => {
    if (message) speech.repeat(message);
  }, [message]);

  return { message, loading, source, say, repeat };
}
