import { NextResponse } from 'next/server';

const DEFAULT_METHODS = 'GET, POST, OPTIONS';
const DEFAULT_HEADERS = 'Content-Type, Authorization';

function getAllowedOrigin(requestOrigin: string | null): string {
  // CORS_ALLOWED_ORIGINS is the primary name; ALLOWED_ORIGINS is accepted as an alias.
  const configured = (
    process.env.CORS_ALLOWED_ORIGINS ?? process.env.ALLOWED_ORIGINS
  )?.trim();

  // Native mobile apps send no Origin header; default to "*" so they are never
  // blocked. CORS only restricts browsers, not the React Native client.
  if (!configured || configured === '*') {
    return '*';
  }

  const allowed = configured
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (requestOrigin && allowed.includes(requestOrigin)) {
    return requestOrigin;
  }

  return allowed[0] ?? '*';
}

export function withCors<T>(response: NextResponse<T>, requestOrigin: string | null) {
  response.headers.set('Access-Control-Allow-Origin', getAllowedOrigin(requestOrigin));
  response.headers.set('Access-Control-Allow-Methods', DEFAULT_METHODS);
  response.headers.set('Access-Control-Allow-Headers', DEFAULT_HEADERS);
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

export function corsPreflightResponse(requestOrigin: string | null) {
  return withCors(new NextResponse(null, { status: 204 }), requestOrigin);
}

export function jsonWithCors(
  body: unknown,
  requestOrigin: string | null,
  init?: { status?: number },
) {
  return withCors(NextResponse.json(body, { status: init?.status ?? 200 }), requestOrigin);
}
