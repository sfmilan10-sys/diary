# Future Self Diary — Backend API

Secure Next.js API for AI-powered “Future Self” reflections. The OpenAI API key stays **only on the server** — never in the Expo mobile app.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check `{ "ok": true }` |
| `POST` | `/api/reflection` | Generate reflection JSON |

## Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set your key:

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

## Run locally

```bash
npm run dev
```

Server: **http://localhost:3000**

- Health: http://localhost:3000/api/health  
- Reflection: http://localhost:3000/api/reflection  

## Connect the Expo app

In the **project root** (not `backend/`), create or edit `.env`:

```env
EXPO_PUBLIC_AI_REFLECTION_ENDPOINT=http://localhost:3000/api/reflection
```

Restart Expo:

```bash
npx expo start
```

### Physical device / emulator notes

- **iOS Simulator / Android emulator** on the same machine: `http://localhost:3000` often works.
- **Physical phone**: use your computer’s LAN IP, e.g. `http://192.168.1.42:3000/api/reflection`, and ensure firewall allows port 3000.

## Test manually

### Health check

```bash
curl http://localhost:3000/api/health
```

Expected:

```json
{ "ok": true }
```

### Reflection

```bash
curl -X POST http://localhost:3000/api/reflection \
  -H "Content-Type: application/json" \
  -d "{\"mood\":\"good\",\"text\":\"Today felt steady. I showed up even when I was tired.\",\"intention\":\"Take a short walk\",\"recentEntries\":[]}"
```

Expected shape:

```json
{
  "reflection": "...",
  "tinyAction": "...",
  "affirmation": "...",
  "quote": "..."
}
```

## Request body

```json
{
  "mood": "good",
  "text": "Journal entry (required)",
  "intention": "Optional intention for tomorrow",
  "recentEntries": [
    {
      "mood": "low",
      "text": "Previous entry text or preview",
      "createdAt": "2026-05-20T12:00:00.000Z",
      "reflectionPreview": "Optional"
    }
  ]
}
```

**Mood** must be one of: `great`, `good`, `okay`, `low`, `heavy` (case-insensitive).

**Limits:** text ≤ 8000 chars, intention ≤ 500 chars, up to 5 recent entries.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI secret key (server only) |
| `OPENAI_MODEL` | No | Default `gpt-4o-mini` |
| `CORS_ALLOWED_ORIGINS` | No | Comma-separated origins; default `*` |

## Production

- Deploy to Vercel, Railway, Fly.io, etc.
- Set `OPENAI_API_KEY` in the host’s secret env.
- Set `EXPO_PUBLIC_AI_REFLECTION_ENDPOINT` in the app to your deployed URL, e.g. `https://api.yourdomain.com/api/reflection`.
- Add rate limiting before public launch (see comment in `app/api/reflection/route.ts`).

## Security

- Never commit `.env` or expose `OPENAI_API_KEY` to clients.
- Customers do **not** supply their own OpenAI keys — your backend uses one server key.
