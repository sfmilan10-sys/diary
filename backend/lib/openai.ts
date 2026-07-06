import OpenAI from 'openai';

import { checkReflectionQuality, buildRepairInstruction } from './qualityCheck';
import type { ReflectionContextInput, ReflectionRequestInput, ReflectionResponseShape } from './validation';
import { validateReflectionResponse } from './validation';

const DEFAULT_MODEL = 'gpt-4o-mini';

const REFLECTION_JSON_SCHEMA = {
  type: 'object',
  properties: {
    reflection: {
      type: 'string',
      description:
        '2-5 sentences from Future You. Mention at least one concrete detail from the current entry. Warm, specific, not generic.',
    },
    tinyAction: {
      type: 'string',
      description:
        'One specific action doable in under 10 minutes, tied to the entry or intention. Not vague self-care.',
    },
    affirmation: {
      type: 'string',
      description: 'One short personal affirmation grounded in what the user wrote. Not generic.',
    },
    quote: {
      type: 'string',
      description:
        'One original short quote specific to this entry. No clichés. No wrapping quotation marks.',
    },
  },
  required: ['reflection', 'tinyAction', 'affirmation', 'quote'],
  additionalProperties: false,
} as const;

const SYSTEM_INSTRUCTIONS = `You are Future You — a compassionate future version of the user in the app "Future Self Diary".

You are NOT a therapist. You do NOT diagnose. You do NOT give medical, legal, or financial advice.

Voice:
- Speak directly to the user as "you" or from "Future Me"
- Warm, grounded, emotionally intelligent, specific
- Match the emotional weight of the entry — do not be falsely cheerful on hard days
- Do not say "as your future self" repeatedly
- Do not use therapy jargon

Content rules:
- Mention at least ONE concrete detail from today's journal entry (a person, event, feeling, phrase, or situation they named)
- If prior context exists, mention AT MOST one relevant recent pattern or gentle contrast — do not invent history
- Do NOT invent facts, people, events, or outcomes not present in the entry or context
- Do NOT overstate certainty from small data
- If intention for tomorrow is provided, connect to it naturally without pressure
- You may include at most ONE thoughtful question from Future Me if it helps — not required
- Avoid clichés like "small steps carry you forward" unless the user themselves used similar language

Field rules:
- reflection: 2-5 sentences
- tinyAction: specific, under 10 minutes, behavior-based (not "be kind to yourself" alone)
- affirmation: personal, tied to their words or effort
- quote: original, short, specific to this entry

Safety: If the journal suggests self-harm, suicide, immediate danger, or crisis:
- Stay calm and supportive
- Encourage contacting local emergency services or a trusted person
- Keep reflection brief and grounding
- Still return valid JSON in the required shape`;

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured on the server');
  }
  return new OpenAI({ apiKey });
}

function getModel(): string {
  return process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;
}

function isDevEnvironment(): boolean {
  return process.env.NODE_ENV !== 'production';
}

function logSafeDiagnostics(
  input: ReflectionRequestInput,
  model: string,
  extra?: Record<string, unknown>,
): void {
  if (!isDevEnvironment()) {
    return;
  }

  const contextCount =
    input.reflectionContext?.recentEntries.length ?? input.recentEntries.length;

  console.info('[reflection]', {
    mood: input.mood,
    hasText: input.text.length > 0,
    textLength: input.text.length,
    hasIntention: Boolean(input.intention),
    contextEntryCount: contextCount,
    model,
    ...extra,
  });
}

function formatContextEntries(context: ReflectionContextInput): string {
  if (!context.recentEntries.length) {
    return 'No prior saved entries.';
  }

  return context.recentEntries
    .map((entry, index) => {
      const lines = [
        `${index + 1}. Date: ${entry.date}${entry.mood ? ` | Mood: ${entry.mood}` : ''}`,
        `Entry preview: ${entry.textPreview}`,
      ];

      if (entry.intention) {
        lines.push(`Intention that day: ${entry.intention}`);
      }
      if (entry.reflectionPreview) {
        lines.push(`Future Me said: ${entry.reflectionPreview}`);
      }
      if (entry.tinyAction) {
        lines.push(`Tiny action offered: ${entry.tinyAction}`);
      }
      if (entry.quote) {
        lines.push(`Quote kept: ${entry.quote}`);
      }

      return lines.join('\n');
    })
    .join('\n\n');
}

function formatLegacyRecentEntries(entries: ReflectionRequestInput['recentEntries']): string {
  if (!entries.length) {
    return 'No prior saved entries.';
  }

  return entries
    .map((entry, index) => {
      const preview = entry.reflectionPreview
        ? `\nPrior reflection: ${entry.reflectionPreview}`
        : '';
      return `${index + 1}. Mood: ${entry.mood} | Date: ${entry.createdAt}\nEntry: ${entry.text}${preview}`;
    })
    .join('\n\n');
}

function formatMoodPattern(context: ReflectionContextInput | undefined): string {
  if (!context || context.moodPattern.totalRecentEntries === 0) {
    return 'No mood pattern yet.';
  }

  const counts = Object.entries(context.moodPattern.moodCounts)
    .filter(([, count]) => count > 0)
    .map(([mood, count]) => `${mood}: ${count}`)
    .join(', ');

  const common = context.moodPattern.mostCommonMood
    ? `Most common recently: ${context.moodPattern.mostCommonMood}.`
    : '';

  return `Recent entries analyzed: ${context.moodPattern.totalRecentEntries}. Mood counts: ${counts || 'none'}. ${common}`.trim();
}

function buildUserPrompt(input: ReflectionRequestInput): string {
  const context = input.reflectionContext;
  const hasContext = Boolean(context?.recentEntries.length);

  const sections = [
    `Current mood: ${input.mood}`,
    `Today's journal entry:\n${input.text}`,
    `Intention for tomorrow: ${input.intention ?? '(none provided)'}`,
  ];

  if (hasContext && context) {
    sections.push(
      `Prior entries (newest first — use lightly, do not invent beyond this):\n${formatContextEntries(context)}`,
      `Mood pattern from recent entries:\n${formatMoodPattern(context)}`,
    );

    if (context.recurringIntentions.length) {
      sections.push(
        `Recurring intentions lately: ${context.recurringIntentions.join(' | ')}`,
      );
    }
    if (context.recentTinyActions.length) {
      sections.push(
        `Recent tiny actions Future You offered: ${context.recentTinyActions.join(' | ')}`,
      );
    }
    if (context.recentQuotes.length) {
      sections.push(`Recent quotes kept: ${context.recentQuotes.join(' | ')}`);
    }
  } else if (input.recentEntries.length) {
    sections.push(
      `Prior entries:\n${formatLegacyRecentEntries(input.recentEntries)}`,
    );
  } else {
    sections.push('Prior entries: First reflection — no saved history yet.');
  }

  sections.push('Respond as Future You. Return JSON only.');

  return sections.join('\n\n');
}

function parseModelJson(outputText: string): ReflectionResponseShape | null {
  try {
    const parsed: unknown = JSON.parse(outputText);
    return validateReflectionResponse(parsed);
  } catch {
    return null;
  }
}

async function callOpenAI(
  client: OpenAI,
  model: string,
  userPrompt: string,
  repairNote?: string,
): Promise<ReflectionResponseShape> {
  const input = repairNote ? `${userPrompt}\n\n${repairNote}` : userPrompt;

  const response = await client.responses.create({
    model,
    instructions: SYSTEM_INSTRUCTIONS,
    input,
    text: {
      format: {
        type: 'json_schema',
        name: 'future_self_reflection',
        schema: REFLECTION_JSON_SCHEMA,
        strict: true,
      },
    },
  });

  const outputText = response.output_text?.trim();
  if (!outputText) {
    throw new Error('OpenAI returned an empty response');
  }

  const parsed = parseModelJson(outputText);
  if (!parsed) {
    throw new Error('OpenAI returned invalid reflection JSON');
  }

  return parsed;
}

export async function generateReflectionWithOpenAI(
  input: ReflectionRequestInput,
): Promise<ReflectionResponseShape> {
  const client = getOpenAIClient();
  const model = getModel();
  const userPrompt = buildUserPrompt(input);

  logSafeDiagnostics(input, model, { phase: 'request' });

  let result = await callOpenAI(client, model, userPrompt);
  let issues = checkReflectionQuality(result);

  if (issues.length > 0) {
    logSafeDiagnostics(input, model, {
      phase: 'quality-retry',
      issueCount: issues.length,
    });

    const repairNote = buildRepairInstruction(issues);
    result = await callOpenAI(client, model, userPrompt, repairNote);
    issues = checkReflectionQuality(result);
  }

  if (issues.length > 0) {
    logSafeDiagnostics(input, model, {
      phase: 'quality-failed',
      issueCount: issues.length,
    });
    throw new Error('Reflection failed quality validation after retry');
  }

  logSafeDiagnostics(input, model, { phase: 'success' });

  return result;
}
