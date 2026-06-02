/** Split spoken lines into short chunks so on-screen text matches the voice. */
export function splitSpeechChunks(text) {
  const trimmed = text?.trim();
  if (!trimmed) return [];

  const parts = trimmed.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g);
  if (!parts?.length) return [trimmed];

  return parts.map((part) => part.trim()).filter(Boolean);
}
