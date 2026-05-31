# AI Oefenmaatje

Research prototype: a Dutch AI-led spelling lesson for children with dyslexia. One guided session—no game menu. Parents and children can use it remotely without a researcher present.

## Features

- **AI lesson mode** — substitute-teacher flow in Dutch (OpenAI + scripted fallback)
- **One guided path**: intro → difficulty → Klinker Detective → Klank volgorde → Woord bouwen
- **Reflection before feedback** — certainty, slow spelling, keep or change answer
- **Reflection flow**: certainty → why → check → feedback
- **Configurable TTS**: ElevenLabs, Azure, Google Cloud, or browser fallback
- **Parent panel**: frustration recovery, session info
- **End survey** for parents (on-screen only, not stored)

## Setup

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Add `OPENAI_API_KEY` and ElevenLabs keys for live AI + Dutch voice (see `.env.example`).

3. Install and run:

```bash
npm install   # required once — installs Vite, Express, etc.
npm run dev     # starts frontend + API together
```

If you prefer two terminals: `npm run dev:client` and `npm run dev:server`.

### ElevenLabs voices

On startup the server lists your account voices and picks a **premade** (free-tier) voice for Dutch. To see all voices:

```bash
npm run voices
# or while the server runs: http://localhost:3001/api/voices
```

To force a specific voice, set `ELEVENLABS_VOICE_ID` in `.env` to an id from that list.

- Frontend: http://localhost:5173  
- API: http://localhost:3001  

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite + API server |
| `npm run dev:client` | Frontend only |
| `npm run dev:server` | API only |

## API routes

- `GET /api/config` — OpenAI/TTS status
- `POST /api/chat` — LLM response (`{ context }`)
- `POST /api/tts` — speech audio or `{ provider: "browser" }`

## Research notes

This prototype tests interaction design, supportive AI feedback, reflection, and remote usability. It does not diagnose dyslexia or replace teachers.
