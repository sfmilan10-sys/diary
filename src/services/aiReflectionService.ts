import type {
  AIReflectionInput,
  FutureSelfReflectionResult,
  ReflectionResult,
} from '../types/reflection';
import { generateLocalReflection } from '../utils/generateLocalReflection';

const MOCK_DELAY_MS = 800;
const REMOTE_TIMEOUT_MS = 12_000;

// Placeholder hosts from docs/.env.example — treated as "not configured" so the
// app stays in local mode instead of hanging on an unreachable URL.
const PLACEHOLDER_ENDPOINT_MARKERS = [
  'your-domain.com',
  'your-backend-url',
  'YOUR-BACKEND-URL',
  'example.com',
];

function getReflectionEndpoint(): string | undefined {
  const endpoint = process.env.EXPO_PUBLIC_AI_REFLECTION_ENDPOINT?.trim();
  if (!endpoint) {
    return undefined;
  }

  const lower = endpoint.toLowerCase();
  const isPlaceholder = PLACEHOLDER_ENDPOINT_MARKERS.some((marker) =>
    lower.includes(marker.toLowerCase()),
  );
  if (isPlaceholder) {
    return undefined;
  }

  return endpoint;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isReflectionResult(value: unknown): value is ReflectionResult {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const result = value as Record<string, unknown>;
  return (
    typeof result.reflection === 'string' &&
    result.reflection.trim().length > 0 &&
    typeof result.tinyAction === 'string' &&
    result.tinyAction.trim().length > 0 &&
    typeof result.affirmation === 'string' &&
    result.affirmation.trim().length > 0 &&
    typeof result.quote === 'string' &&
    result.quote.trim().length > 0
  );
}

async function generateLocalWithDelay(
  input: AIReflectionInput,
): Promise<FutureSelfReflectionResult> {
  const [local] = await Promise.all([
    Promise.resolve(
      generateLocalReflection(
        input.mood,
        input.text,
        input.intention,
        input.reflectionContext,
      ),
    ),
    delay(MOCK_DELAY_MS),
  ]);

  return {
    ...local,
    source: 'local',
    usedFallback: false,
  };
}

async function fetchRemoteReflection(
  endpoint: string,
  input: AIReflectionInput,
): Promise<ReflectionResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REMOTE_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        mood: input.mood,
        text: input.text,
        intention: input.intention ?? undefined,
        reflectionContext: input.reflectionContext ?? undefined,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Remote reflection request failed with status ${response.status}`);
    }

    const data: unknown = await response.json();

    if (!isReflectionResult(data)) {
      throw new Error('Remote reflection response was missing required fields');
    }

    return {
      reflection: data.reflection.trim(),
      tinyAction: data.tinyAction.trim(),
      affirmation: data.affirmation.trim(),
      quote: data.quote.trim(),
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function generateFutureSelfReflection(
  input: AIReflectionInput,
): Promise<FutureSelfReflectionResult> {
  const trimmedText = input.text.trim();
  if (!trimmedText) {
    throw new Error('Reflection input text cannot be empty');
  }

  const normalizedInput: AIReflectionInput = {
    mood: input.mood,
    text: trimmedText,
    intention: input.intention?.trim() || undefined,
    reflectionContext: input.reflectionContext,
  };

  const endpoint = getReflectionEndpoint();

  if (!endpoint) {
    return generateLocalWithDelay(normalizedInput);
  }

  try {
    const remote = await fetchRemoteReflection(endpoint, normalizedInput);
    return {
      ...remote,
      source: 'remote',
      usedFallback: false,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.warn(
      `[aiReflectionService] Remote reflection unavailable (${message}). Using local fallback.`,
    );
    const local = await generateLocalWithDelay(normalizedInput);
    return {
      ...local,
      source: 'local',
      usedFallback: true,
    };
  }
}
