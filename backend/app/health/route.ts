import { corsPreflightResponse, jsonWithCors } from '@/lib/cors';

export async function GET(request: Request) {
  const origin = request.headers.get('origin');
  return jsonWithCors({ ok: true, service: 'future-self-diary-api' }, origin);
}

export async function OPTIONS(request: Request) {
  return corsPreflightResponse(request.headers.get('origin'));
}
