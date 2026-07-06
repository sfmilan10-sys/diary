import { generateReflectionWithOpenAI } from '@/lib/openai';
import { corsPreflightResponse, jsonWithCors } from '@/lib/cors';
import { checkReflectionRateLimit, getClientIp } from '@/lib/rateLimit';
import { validateReflectionRequest } from '@/lib/validation';

// Per-IP rate limiting is applied below via an in-memory limiter.
// For multi-instance / serverless deployments, swap in a shared store (Redis/KV).

// Reject oversized payloads early (the app sends a small, trimmed context).
const MAX_REQUEST_BYTES = 256_000; // ~250 KB

export async function POST(request: Request) {
  const origin = request.headers.get('origin');

  try {
    const contentLength = Number(request.headers.get('content-length'));
    if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
      return jsonWithCors(
        { error: 'Request too large', details: 'Please shorten your entry and try again.' },
        origin,
        { status: 413 },
      );
    }

    const rateLimit = checkReflectionRateLimit(getClientIp(request));
    if (!rateLimit.allowed) {
      return jsonWithCors(
        {
          error: 'Too many reflection requests. Please wait a little and try again.',
        },
        origin,
        { status: 429 },
      );
    }

    if (!process.env.OPENAI_API_KEY?.trim()) {
      return jsonWithCors(
        { error: 'Server misconfiguration', details: 'OPENAI_API_KEY is not set.' },
        origin,
        { status: 500 },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonWithCors(
        { error: 'Invalid JSON', details: 'Request body must be valid JSON.' },
        origin,
        { status: 400 },
      );
    }

    const validated = validateReflectionRequest(body);
    if ('error' in validated) {
      return jsonWithCors(validated, origin, { status: 400 });
    }

    const reflection = await generateReflectionWithOpenAI(validated);
    return jsonWithCors(reflection, origin);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error';
    console.error('[POST /api/reflection] failed:', message);

    return jsonWithCors(
      {
        error: 'Reflection generation failed',
        details: 'Please try again in a moment.',
      },
      origin,
      { status: 500 },
    );
  }
}

export async function OPTIONS(request: Request) {
  return corsPreflightResponse(request.headers.get('origin'));
}
