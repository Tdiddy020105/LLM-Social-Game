# Deploy Oefenmaatje on Netlify

## What gets deployed

- **Frontend**: Vite build in `dist/` (the lesson UI)
- **API**: Netlify Functions at `/api/chat` and `/api/config` (Gemini for feedback only)
- **Speech**: browser voice in the child’s device (no ElevenLabs)

## One-time setup

1. Push this repo to GitHub (or GitLab).
2. Log in at [https://app.netlify.com](https://app.netlify.com).
3. **Add new site** → **Import an existing project** → choose the repo.
4. Netlify should read `netlify.toml` automatically:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. **Site settings → Environment variables** → add:
   - `GOOGLE_GENAI_API_KEY` = your key from [Google AI Studio](https://aistudio.google.com/apikey)
   - Optional: `GEMINI_MODEL` = `gemini-2.5-flash` (default if omitted)
6. **Deploy site**.

## After deploy

- Open the site URL (e.g. `https://your-site-name.netlify.app`).
- Test: parent landing → **Start** → kid intro → play → wrong answer (Gemini feedback) → correct answer (Gemini praise).
- If Gemini is missing, feedback still works (scripted fallback).

## Local check before deploy

```bash
cd ai-oefenmaatje
npm install
npm run build
```

Optional, with Netlify CLI:

```bash
npm install -g netlify-cli
netlify dev
```

Put `GOOGLE_GENAI_API_KEY` in a local `.env` file (not committed). `netlify dev` loads it for functions.

## Tester instructions (email)

- Use **Chrome or Edge**, volume on.
- Parent reads the first screen; child clicks **Start**.
- After the lesson, parent fills in the **survey from email**.

## Troubleshooting

| Problem | Fix |
|--------|-----|
| Start stays on “Laden…” | Hard refresh; check deploy logs for build errors |
| No AI feedback, only fixed lines | Add `GOOGLE_GENAI_API_KEY` in Netlify env and **redeploy** |
| No sound | Browser voice; try Chrome; tap **Start** (needs a click for speech) |
| 404 on refresh | `netlify.toml` SPA redirect should handle this; redeploy if missing |
