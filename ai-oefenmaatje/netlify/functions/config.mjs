import { getTtsConfig } from "../../server/tts.js";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

export default async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  const ai = Boolean(process.env.GOOGLE_GENAI_API_KEY?.trim());
  const tts = getTtsConfig();

  return new Response(
    JSON.stringify({ ai, tts }),
    {
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
    }
  );
};
