/**
 * Backend smoke test for Future Self Diary.
 *
 * Usage:
 *   node scripts/smoke-test.js https://your-backend-url.com
 *   npm run smoke:test -- https://your-backend-url.com
 *
 * Checks:
 *   1. GET /health   (falls back to /api/health)
 *   2. POST /api/reflection with a harmless sample
 *
 * Prints only status codes and whether expected fields exist.
 * Does NOT print reflection content and contains NO secrets.
 * Requires Node 18+ (global fetch).
 */

const REQUIRED_FIELDS = ['reflection', 'tinyAction', 'affirmation', 'quote'];

// Note: mood must be one of great|good|okay|low|heavy (backend validates it),
// so we use "good" here rather than a free-text mood.
const SAMPLE = {
  mood: 'good',
  text: 'Today I made a small step toward testing my app.',
  intention: 'Keep it simple tomorrow.',
};

function fail(message) {
  console.log(`✗ ${message}`);
  process.exitCode = 1;
}

async function checkHealth(baseUrl) {
  for (const path of ['/health', '/api/health']) {
    try {
      const res = await fetch(`${baseUrl}${path}`, {
        headers: { Accept: 'application/json' },
      });
      console.log(`GET ${path} → ${res.status}`);
      if (res.ok) {
        return true;
      }
    } catch (error) {
      console.log(`GET ${path} → error: ${error instanceof Error ? error.message : 'unknown'}`);
    }
  }
  return false;
}

async function checkReflection(baseUrl) {
  try {
    const res = await fetch(`${baseUrl}/api/reflection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(SAMPLE),
    });

    console.log(`POST /api/reflection → ${res.status}`);

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      fail(`Reflection request failed (${res.status}): ${data.error ?? 'unknown error'}`);
      return;
    }

    const missing = REQUIRED_FIELDS.filter(
      (field) => typeof data[field] !== 'string' || data[field].trim().length === 0,
    );

    for (const field of REQUIRED_FIELDS) {
      console.log(`  ${field}: ${missing.includes(field) ? 'MISSING' : 'present'}`);
    }

    if (missing.length > 0) {
      fail(`Reflection response missing fields: ${missing.join(', ')}`);
    } else {
      console.log('✓ Reflection endpoint returned all required fields.');
    }
  } catch (error) {
    fail(`Reflection request error: ${error instanceof Error ? error.message : 'unknown'}`);
  }
}

async function main() {
  const rawBase = process.argv[2];
  if (!rawBase) {
    console.log('Usage: node scripts/smoke-test.js https://your-backend-url.com');
    process.exitCode = 1;
    return;
  }

  // Accept either a base URL or a full .../api/reflection URL.
  const baseUrl = rawBase
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/api\/reflection$/i, '');
  console.log(`Smoke testing: ${baseUrl}\n`);

  const healthy = await checkHealth(baseUrl);
  if (!healthy) {
    fail('Health check did not return a 2xx response.');
  }

  console.log('');
  await checkReflection(baseUrl);
}

main();
