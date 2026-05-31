/**
 * List ElevenLabs voices on your account (uses .env in project root).
 * Run: node scripts/list-voices.mjs
 */
import "dotenv/config";

const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
if (!apiKey) {
  console.error("Set ELEVENLABS_API_KEY in .env");
  process.exit(1);
}

const res = await fetch("https://api.elevenlabs.io/v1/voices", {
  headers: { "xi-api-key": apiKey },
});

if (!res.ok) {
  console.error("Failed:", res.status, await res.text());
  process.exit(1);
}

const { voices } = await res.json();
console.log("\nYour ElevenLabs voices:\n");
for (const v of voices) {
  console.log(
    `  ${v.name.padEnd(22)} ${v.voice_id}  [${v.category || "?"}]`
  );
}
console.log(`\nTotal: ${voices.length}`);
console.log("\nPremade voices are usually free. Set in .env:");
console.log("  ELEVENLABS_VOICE_ID=<id from list above>\n");
