# Quick Start — Test Future Self Diary on your Android phone

A simple guide to get a real Android app on your phone, with real AI
reflections, for personal testing. No app store, no accounts inside the app.

---

## A. What this setup does

- Your **Android app** calls a **temporary backend** you deploy (on Render).
- The **backend** calls **OpenAI** and returns the reflection.
- Your **OpenAI key stays on the backend only** — it is never in the app.
- Your **diary entries stay on your phone**. When you tap **Reflect**, only the
  current entry (plus a small recent-context summary) is sent to the backend to
  generate that one reflection. The backend does **not** store your entries.
- If the backend is down or unset, the app still works using a **local,
  on-device fallback** reflection.

---

## B. Steps you must do by hand (only these)

1. **Create an OpenAI API key** at https://platform.openai.com (and set a small
   monthly budget so testing can't surprise you).
2. **Deploy the `backend` folder to Render** (see section C).
3. **Set the Render environment variables** (section C).
4. **Copy your Render URL** (looks like `https://future-self-diary-api.onrender.com`).
5. **Save the endpoint locally:** `npm run set:endpoint -- https://YOUR-RENDER-URL`
6. **Build the APK:** `npm run android:preview`

Everything else is automated by the commands in section D.

---

## C. Render settings

You can either use the included **`render.yaml` blueprint** (New + → Blueprint →
pick this repo) or set it up manually:

- **Service type:** Web Service
- **Root Directory:** `backend`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

**Environment variables:**

```
NODE_ENV=production
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-5.5
ALLOWED_ORIGINS=
REFLECTION_RATE_LIMIT_WINDOW_MS=900000
REFLECTION_RATE_LIMIT_MAX=20
```

- `OPENAI_API_KEY` is **secret** — enter it only in the Render dashboard.
- `ALLOWED_ORIGINS` stays **empty on purpose**: the phone app sends no browser
  Origin, so an empty value lets it through (CORS only restricts browsers).
- Raise `REFLECTION_RATE_LIMIT_MAX` to `50` if you hit limits while testing.

After it deploys, open these in a browser:
- `https://YOUR-RENDER-URL/health` → should show `{ "ok": true }`
- `https://YOUR-RENDER-URL/`

---

## D. Commands you run locally (after Render is live)

```bash
# 1. Confirm the backend works (health + a real reflection round-trip):
npm run backend:smoke -- https://YOUR-RENDER-URL

# 2. Save the endpoint into your local .env:
npm run set:endpoint -- https://YOUR-RENDER-URL

# 3. Double-check everything is ready:
npm run doctor:testing

# 4. Build the installable APK (opens an EAS cloud build):
npm run android:preview
```

Then download the APK from the EAS build link and install it on your phone.

---

## E. How to know real AI is working

On the reflection screen, the small note under the title tells you the source:

- **"Generated with Future Self AI."** → real OpenAI via your backend. ✅
- **"Generated privately on this device."** → local mode (no/placeholder endpoint).
- **"The AI was unavailable, so this was generated privately on your device."** →
  backend was set but the request failed; you still got a reflection.

---

## F. Troubleshooting

- **You see "Generated privately on this device."** → the app isn't pointed at
  your backend. Run `npm run set:endpoint -- https://YOUR-RENDER-URL`, then
  **rebuild** the APK (`npm run android:preview`).
- **You see "The AI was unavailable…"** → the backend was reached but failed.
  Check Render logs and run `npm run backend:smoke -- https://YOUR-RENDER-URL`.
- **Smoke test fails** → check, in order: `OPENAI_API_KEY` is set on Render,
  OpenAI billing/budget is active, the Render deploy succeeded, `OPENAI_MODEL`
  is a real model name, and you haven't hit the rate limit.
- **App still uses the old endpoint** → `EXPO_PUBLIC_*` values are baked in at
  build time. Change the endpoint, then **rebuild** the APK.
- **First request is slow** → Render's free tier sleeps when idle; the first
  call after a nap can take 30–60s while it wakes up.

> Security reminder: never put `OPENAI_API_KEY` in the app or in any
> `EXPO_PUBLIC_*` variable. Only the backend holds the key.
