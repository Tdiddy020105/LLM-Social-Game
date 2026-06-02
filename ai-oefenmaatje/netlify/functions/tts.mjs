import { synthesizeSpeech } from "../../server/tts.js";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export default async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const text = body?.text?.trim();
    if (!text) {
      return new Response(JSON.stringify({ error: "Missing text" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const result = await synthesizeSpeech(text);
    if (result.provider === "browser") {
      return new Response(
        JSON.stringify({ provider: "browser", reason: result.reason }),
        {
          status: 503,
          headers: { ...cors, "Content-Type": "application/json" },
        }
      );
    }

    const bytes =
      result.audio instanceof Uint8Array
        ? result.audio
        : new Uint8Array(result.audio);

    return new Response(bytes, {
      status: 200,
      headers: {
        ...cors,
        "Content-Type": result.contentType || "audio/mpeg",
        "X-TTS-Provider": result.provider,
      },
    });
  } catch (error) {
    console.error("tts function error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "TTS failed" }),
      {
        status: 502,
        headers: { ...cors, "Content-Type": "application/json" },
      }
    );
  }
};
