# AI Oefenmaatje

Research prototype: a Dutch guided spelling lesson for children with dyslexia (groep 4+). One session per visit—no game menu. Parents and children can use it remotely without a researcher present.

## Features

- **Three difficulty levels** — each level uses a different exercise (Margit's approach):
  - **Makkelijk** — see the word + picture; build the **blauw/wit block pattern** underneath (same blocks as her method, no letters on blocks)
  - **Normaal** — hear the word; pick the correct blue/white block pattern
  - **Moeilijk** — hear the word; build the pattern, then type the word
- **Reflection before feedback** — certainty check before the maatje confirms
- **Scripted Dutch companion** — exact match between voice and on-screen caption
- **Google Cloud TTS** (optional) or browser fallback
- **Parent panel** — session info and recovery controls
- **End note** for parents (on-screen only)

## Setup

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Optional: `GOOGLE_GENAI_API_KEY`, `GOOGLE_TTS_API_KEY`, `TTS_PROVIDER=google`

3. Install and run:

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173  
- API: http://localhost:3001  

## Word images

Place illustrations in `public/words/` (e.g. `maan.webp`). Update `image` paths in `src/data/words.js`. SVG placeholders are included until real assets are added.

## API routes

- `GET /api/config` — GenAI/TTS status
- `POST /api/chat` — LLM response (optional; lesson uses scripted lines)
- `POST /api/tts` — speech audio

## Research notes

This prototype tests interaction design, reflection, and remote usability with dyslexia specialists. It does not diagnose dyslexia or replace teachers.
