# AI Oefenmaatje

Dutch spelling practice for children with dyslexia (groep 4+), based on specialist feedback.

## Three levels (Margit's model)

| Level | What the child does |
|-------|---------------------|
| **Makkelijk** | See word + picture → lay blauw/wit blocks underneath |
| **Normaal** | Hear word → pick the correct block pattern |
| **Moeilijk** | Hear word → lay blauw/wit blocks |

Speech is kept short: intro, the word (listen levels), reflect, brief feedback.

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Word images live in `public/words/` (one file per word in `src/data/words.js`).

## API

- `GET /api/config` — TTS status
- `POST /api/tts` — speech audio
