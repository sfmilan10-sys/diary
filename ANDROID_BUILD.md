# Building Future Self Diary for Android (EAS Build)

This app uses **managed Expo + EAS Build** — no `android/` native folder is
committed and you do not need Android Studio. You build in the cloud and
download an installable file.

- **APK** (preview profile) → for sideloading onto your own phone for testing.
- **AAB** (production profile) → for uploading to Google Play later.

The OpenAI API key stays on the backend. The app only knows the **public
reflection endpoint URL**. If the backend is unreachable, the app falls back to
on-device reflections automatically.

---

## App identity (already configured)

| Field | Value |
|-------|-------|
| App name | Future Self Diary |
| Slug | future-self-diary |
| Android package | com.futureselfdiary.app |
| Version | 1.0.0 |
| Android versionCode | 1 |

> If you own a domain, you may change the package to your own reverse-domain
> name (e.g. `com.yourname.futureselfdiary`) **before your first Play Store
> upload**. After uploading to Play, the package name is permanent.

---

## A. Install EAS CLI

```bash
npm install -g eas-cli
```

## B. Log in to your Expo account

```bash
eas login
```

(Create a free account at https://expo.dev if you don't have one.)

## C. Configure the project (first time only)

```bash
eas build:configure
```

This links the project to your Expo account and sets the EAS project ID.
`eas.json` already exists, so you can keep its profiles.

## D. Set the production backend URL

`EXPO_PUBLIC_*` variables are bundled at **build time**, so set the URL before
building. Easiest: create a `.env` at the app root (see `.env.example`):

```
EXPO_PUBLIC_AI_REFLECTION_ENDPOINT=https://your-domain.com/api/reflection
```

- Use your **public HTTPS** backend URL (e.g. your Hostinger domain).
- Do **not** use `localhost` — an installed phone cannot reach your PC.
- If you change the URL later, you must **rebuild**.
- If unset, the app still runs using the local fallback reflection.

## E. Build an installable APK (for testing)

```bash
eas build --platform android --profile preview
```

or:

```bash
npm run android:preview
```

## F. Download the APK

When the build finishes, EAS prints a build URL. Open it (or go to
https://expo.dev → your project → Builds) and download the `.apk`.

## G. Install on your Android phone

1. Transfer/open the `.apk` on your phone (download link, email, or USB).
2. If prompted, allow **Install from unknown sources** for the app you used to
   open it (browser/Files).
3. Tap **Install**.
4. Open **Future Self Diary**.

## H. Build an AAB for Google Play (later)

```bash
eas build --platform android --profile production
```

or:

```bash
npm run android:production
```

Upload the resulting `.aab` to the Google Play Console.

---

## Testing with real OpenAI reflections

To get real AI reflections (not just the local fallback) in your APK:

1. **Deploy the backend first** to a public HTTPS host — see
   `backend/DEPLOY_TEMP_TESTING.md` (Render is easiest).
2. **Verify it's live:** open `https://YOUR-BACKEND-URL/health` → `{ "ok": true }`,
   and run `cd backend && npm run smoke:test -- https://YOUR-BACKEND-URL`.
3. **Point the app at the backend before building** (root `.env`):
   ```
   EXPO_PUBLIC_AI_REFLECTION_ENDPOINT=https://YOUR-BACKEND-URL/api/reflection
   ```
4. **Build the APK:**
   ```bash
   eas build --platform android --profile preview
   ```
5. **Install on Android**, open the app, write an entry, tap **Reflect**.
6. **If the backend URL changes, rebuild the APK** — `EXPO_PUBLIC_*` values are
   bundled at build time and cannot change after the build.

### Optional: store the endpoint in EAS instead of `.env`

```bash
eas env:create --name EXPO_PUBLIC_AI_REFLECTION_ENDPOINT \
  --value https://YOUR-BACKEND-URL/api/reflection \
  --environment preview --visibility plaintext
```

This endpoint is **not secret**, so `plaintext` visibility is fine. Only
`OPENAI_API_KEY` is secret, and it belongs on the **backend**, never in the app.

### Source messages you should see
- Remote AI worked: **"Generated with Future Self AI."**
- No endpoint / placeholder / local mode: **"Generated privately on this device."**
- Backend failed mid-request: **"The AI was unavailable, so this was generated privately on your device."**

---

## I. Test checklist after installing

- [ ] App opens to onboarding / home.
- [ ] Write a journal entry.
- [ ] Choose a mood.
- [ ] Add an intention (optional).
- [ ] Tap **Reflect** → AI reflection loads via the public backend.
- [ ] Source note reads "Generated with Future Self AI."
- [ ] Point the URL at a bad/unreachable endpoint (or stop the backend) and
      Reflect → reflection still appears with
      "The AI was unavailable, so this was generated privately on your device."
- [ ] **Save entry**.
- [ ] Fully close and reopen the app → the saved entry persists.
- [ ] Timeline shows the entry; open detail; edit; delete.
- [ ] Weekly recap loads (offline, no network needed).
- [ ] Daily prompt "Use this prompt" inserts/append text.
- [ ] If you write an entry implying self-harm, the calm support note appears.
- [ ] Turn on **Airplane mode** → writing, saving, recap, and local fallback
      reflections all still work.

---

## Before sharing widely (release checklist)

- [ ] Hostinger backend deployed over **HTTPS**.
- [ ] `EXPO_PUBLIC_AI_REFLECTION_ENDPOINT` points to the HTTPS backend.
- [ ] OpenAI key is **only** on the backend (`backend/.env`), never in the app.
- [ ] Backend does not log full diary text or reflections.
- [ ] App icon and splash are final artwork.
- [ ] App name is final.
- [ ] Android package name is final (permanent after first Play upload).
- [ ] `version` and `android.versionCode` are correct (bump versionCode each
      Play upload).
- [ ] Privacy policy drafted (required for Play Store).
- [ ] Backend rate limiting enabled (already implemented on `/api/reflection`).
- [ ] Error/local-fallback path tested on a real device.
- [ ] Tested on a physical Android device.

---

## Notes / TODO

- Current `assets/icon.png`, `adaptive-icon.png`, and `splash-icon.png` are
  valid square 1024×1024 placeholders. **Replace with final artwork before the
  Play Store launch.**
- This project stays in **managed** Expo. Do **not** run `expo prebuild` or
  commit `android/`/`ios/` folders unless you intentionally switch to the bare
  workflow.
