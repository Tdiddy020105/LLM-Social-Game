# AI Oefenmaatje

Research prototype: a Dutch AI-led spelling lesson for children with dyslexia. One guided session—no game menu. Parents and children can use it remotely without a researcher present.

## Features

- **AI lesson mode** — substitute-teacher flow in Dutch (Google Gemini + scripted fallback)
- **One guided path**: intro → difficulty → Klinker Detective → Klank volgorde → Woord bouwen
- **Reflection before feedback** — certainty, slow spelling, keep or change answer
- **Reflection flow**: certainty → why → check → feedback
- **Browser TTS** (free Dutch voice in Chrome/Edge/Safari); optional Azure/Google via server
- **Parent panel**: frustration recovery, session info
- **End survey** for parents (on-screen only, not stored)

## Setup

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Optional: `GOOGLE_GENAI_API_KEY` in `.env`. Speech uses the browser by default (`TTS_PROVIDER=browser`).

3. Install and run:

```bash
npm install   # required once — installs Vite, Express, etc.
npm run dev     # starts frontend + API together
```

If you prefer two terminals: `npm run dev:client` and `npm run dev:server`.

- Frontend: http://localhost:5173  
- API: http://localhost:3001  

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite + API server |
| `npm run dev:client` | Frontend only |
| `npm run dev:server` | API only |

## API routes

- `GET /api/config` — GenAI/TTS status
- `POST /api/chat` — LLM response (`{ context }`)
- `POST /api/tts` — speech audio or `{ provider: "browser" }`

## Research notes

This prototype tests interaction design, supportive AI feedback, reflection, and remote usability. It does not diagnose dyslexia or replace teachers.
