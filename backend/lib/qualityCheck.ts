import type { ReflectionResponseShape } from './validation';

const GENERIC_QUOTES = [
  'small steps carry you forward',
  'one day at a time',
  'you got this',
  'believe in yourself',
  'everything happens for a reason',
  'trust the process',
  'be kind to yourself',
  'this too shall pass',
];

const VAGUE_ACTION_PATTERNS = [
  /^be kind(er)? to yourself\.?$/i,
  /^practice self[- ]?care\.?$/i,
  /^take care of yourself\.?$/i,
  /^be gentle with yourself\.?$/i,
  /^try to relax\.?$/i,
  /^stay positive\.?$/i,
];

export interface QualityIssue {
  field: keyof ReflectionResponseShape;
  reason: string;
}

function isGenericQuote(quote: string): boolean {
  const lower = quote.toLowerCase().trim();
  return GENERIC_QUOTES.some(
    (phrase) => lower === phrase || lower.includes(phrase),
  );
}

function isVagueTinyAction(action: string): boolean {
  const trimmed = action.trim();
  if (trimmed.length < 12) {
    return true;
  }
  return VAGUE_ACTION_PATTERNS.some((pattern) => pattern.test(trimmed));
}

function isGenericAffirmation(affirmation: string): boolean {
  const lower = affirmation.toLowerCase();
  const genericStarts = ['you are enough', 'you got this', 'believe in yourself'];
  return genericStarts.some((phrase) => lower.startsWith(phrase));
}

export function checkReflectionQuality(
  response: ReflectionResponseShape,
): QualityIssue[] {
  const issues: QualityIssue[] = [];

  if (response.reflection.length < 40) {
    issues.push({ field: 'reflection', reason: 'reflection too short' });
  }

  if (response.reflection.length > 1200) {
    issues.push({ field: 'reflection', reason: 'reflection too long' });
  }

  if (isVagueTinyAction(response.tinyAction)) {
    issues.push({ field: 'tinyAction', reason: 'tinyAction too vague' });
  }

  if (isGenericAffirmation(response.affirmation)) {
    issues.push({ field: 'affirmation', reason: 'affirmation too generic' });
  }

  if (isGenericQuote(response.quote)) {
    issues.push({ field: 'quote', reason: 'quote too generic' });
  }

  return issues;
}

export function buildRepairInstruction(issues: QualityIssue[]): string {
  const notes = issues.map((issue) => `${issue.field}: ${issue.reason}`).join('; ');
  return [
    'The previous JSON failed quality checks.',
    `Issues: ${notes}.`,
    'Rewrite all four fields.',
    'tinyAction must name one concrete behavior doable in under 10 minutes.',
    'quote must be original and tied to the journal entry, not a common cliché.',
    'affirmation must feel personal, not generic self-help.',
    'Return only valid JSON with reflection, tinyAction, affirmation, quote.',
  ].join(' ');
}
