# Temporary Backend Deployment (for personal APK testing)

This deploys the **reflection backend** to a public HTTPS host so your Android
APK can get real OpenAI reflections. It is meant for a few weeks of personal
testing — not a hardened production launch.

> **Stack note:** this backend is a **Next.js (App Router) API**, not a bare
> Express server. The build/start commands below (`npm run build` / `npm start`)
> map to `next build` / `next start`, so the standard Node host settings work.

## What stays secret
- `OPENAI_API_KEY` lives **only** in the host's environment variables.
- It is **never** in the app, never in `EXPO_PUBLIC_*`, never committed.
- The app only knows the public endpoint URL.

## Endpoints
- `GET /health` → `{ "ok": true }`
- `GET /api/health` → `{ "ok": true }`
- `GET /` → simple HTML info page
- `POST /api/reflection` → the reflection endpoint the app calls

---

## Option A — Render (recommended, simplest)

1. **Push the repo to GitHub** (ensure `.env` is gitignored — only `.env.example` is committed).
2. In Render, create **New → Web Service** and connect the repo.
3. Settings:
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. **Environment variables:**

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `OPENAI_API_KEY` | `sk-...` (your real key — secret) |
   | `OPENAI_MODEL` | `gpt-4o-mini` (the default; override here if you want another) |
   | `ALLOWED_ORIGINS` | leave empty for mobile-only testing (defaults to `*`) |
   | `REFLECTION_RATE_LIMIT_WINDOW_MS` | `900000` (15 min) |
   | `REFLECTION_RATE_LIMIT_MAX` | `20` (raise to `50` if you hit limits while testing) |

   > `PORT` is provided by Render automatically; `next start` uses it.
   > You do **not** need to set `PORT`.

5. **Deploy.**
6. **Test in a browser / terminal:**
   - `https://YOUR-RENDER-URL/health`
   - `https://YOUR-RENDER-URL/`
7. Your reflection endpoint is:
   - `https://YOUR-RENDER-URL/api/reflection`

---

## Option B — Railway (quick alternative)

- New Project → Deploy from GitHub repo.
- Set **Root Directory** to `backend`.
- Build: `npm install && npm run build` · Start: `npm start`.
- Add the same environment variables as the Render table.
- Railway provides `PORT` automatically.

## Option C — Fly.io / Hostinger (VPS-style)

- Run on a Node 18+ host: `npm install && npm run build`, then `npm start`.
- Put it behind HTTPS (Fly handles TLS; on a Hostinger VPS use Nginx + a TLS cert).
- Set the same environment variables in the host's secret store.
- Ensure the public URL is **HTTPS** before pointing the app at it.

---

## After deploying

Run the smoke test from your machine:

```bash
cd backend
npm run smoke:test -- https://YOUR-RENDER-URL
```

Expected: `GET /health → 200` and `POST /api/reflection → 200` with all four
fields present.

## Do NOT
- Do **not** put `OPENAI_API_KEY` in the app or in any `EXPO_PUBLIC_*` variable.
- Do **not** commit `.env` (only `.env.example`).
- Do **not** disable rate limiting.
