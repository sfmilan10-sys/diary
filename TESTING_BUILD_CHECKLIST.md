# Temporary Testing Build Checklist

Use this before and after building a personal Android APK that uses real OpenAI
reflections through your public backend.

## Backend
- [ ] `OPENAI_API_KEY` is set **only** on the backend host (Render/Railway/etc.), never in the app.
- [ ] `GET /health` returns `{ "ok": true }`.
- [ ] `POST /api/reflection` works via smoke test:
      `cd backend && npm run smoke:test -- https://YOUR-BACKEND-URL`
- [ ] No sensitive logs (no full diary text or reflections in server logs).
- [ ] Rate limiting enabled on `/api/reflection` (default 20 / 15 min).
- [ ] Public **HTTPS** URL is available.

## App
- [ ] `EXPO_PUBLIC_AI_REFLECTION_ENDPOINT` points to the **HTTPS** backend
      (`https://YOUR-BACKEND-URL/api/reflection`).
- [ ] No `OPENAI_API_KEY` (and no `EXPO_PUBLIC_OPENAI*`) anywhere in app files.
- [ ] APK built with the **preview** profile (`eas build -p android --profile preview`).
- [ ] Installed on a physical Android phone.
- [ ] **Reflect** uses remote AI → source note "Generated with Future Self AI."
- [ ] Fallback works if backend is down/unreachable → "The AI was unavailable, so this was generated privately on your device."
- [ ] Save / timeline / detail / edit / delete all work.
- [ ] Weekly recap works offline (no network needed).
- [ ] Entries persist after fully restarting the app.

## Cost control
- [ ] Set a monthly usage limit / budget in the OpenAI dashboard.
- [ ] Use a low-cost model for testing (e.g. `gpt-4o-mini`).
- [ ] Keep the rate limit modest for personal testing (20–50 / 15 min).
- [ ] Rotate the OpenAI key after testing if it was ever exposed accidentally.

## Reminders
- `EXPO_PUBLIC_*` is bundled at build time → rebuild the APK if the backend URL changes.
- Never use `localhost` in an installed APK — the phone can't reach your PC.
- Only `OPENAI_API_KEY` is secret; the endpoint URL is not.
