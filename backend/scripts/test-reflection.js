/**
 * Manual reflection API test script.
 *
 * Usage:
 *   node backend/scripts/test-reflection.js
 *   REFLECTION_URL=http://localhost:3000/api/reflection node backend/scripts/test-reflection.js
 *
 * Requires the backend running with OPENAI_API_KEY set.
 * Does not log full journal text — only fixture names and status.
 */

const BASE_URL =
  process.env.REFLECTION_URL?.trim() || 'http://localhost:3000/api/reflection';

const FIXTURES = [
  {
    name: 'first-time user (no prior context)',
    body: {
      mood: 'okay',
      text: 'First day trying this app. I am not sure what to write but I want to feel less scattered before bed.',
      intention: 'Go to sleep without scrolling',
      reflectionContext: {
        recentEntries: [],
        moodPattern: { totalRecentEntries: 0, moodCounts: {} },
        recurringIntentions: [],
        recentTinyActions: [],
        recentQuotes: [],
      },
    },
  },
  {
    name: 'recurring anxious mood with repeated intention',
    body: {
      mood: 'low',
      text: 'Work piled up again and my chest felt tight during the afternoon meeting. I kept rehearsing what I should have said.',
      intention: 'Pause before replying to emails',
      reflectionContext: {
        recentEntries: [
          {
            date: new Date(Date.now() - 86400000).toISOString(),
            mood: 'low',
            textPreview: 'Another anxious day at work. Could not focus after lunch.',
            intention: 'Pause before replying to emails',
            reflectionPreview: 'Your nervous system has been working overtime. Rest is not quitting.',
            tinyAction: 'Take three slow breaths before opening your inbox tomorrow morning.',
          },
          {
            date: new Date(Date.now() - 2 * 86400000).toISOString(),
            mood: 'heavy',
            textPreview: 'Deadline stress and I snapped at a friend over text.',
            intention: 'Pause before replying to emails',
          },
        ],
        moodPattern: {
          totalRecentEntries: 2,
          moodCounts: { low: 1, heavy: 1 },
          mostCommonMood: 'Low',
        },
        recurringIntentions: ['Pause before replying to emails'],
        recentTinyActions: [
          'Take three slow breaths before opening your inbox tomorrow morning.',
        ],
        recentQuotes: ['Worry shrinks the world — you can widen it one breath at a time.'],
      },
    },
  },
  {
    name: 'positive/growth week',
    body: {
      mood: 'good',
      text: 'I finally told my manager I want to lead the small project. I was scared but it felt honest.',
      intention: 'Prepare one slide tonight',
      reflectionContext: {
        recentEntries: [
          {
            date: new Date(Date.now() - 86400000).toISOString(),
            mood: 'great',
            textPreview: 'Had coffee with Mia and laughed for the first time in days.',
            quote: 'Joy remembered is joy kept.',
          },
          {
            date: new Date(Date.now() - 3 * 86400000).toISOString(),
            mood: 'good',
            textPreview: 'Finished the draft I had been avoiding. Not perfect, but done.',
            tinyAction: 'Celebrate with a 10-minute walk after dinner.',
          },
        ],
        moodPattern: {
          totalRecentEntries: 2,
          moodCounts: { great: 1, good: 1 },
          mostCommonMood: 'Good',
        },
        recurringIntentions: [],
        recentTinyActions: ['Celebrate with a 10-minute walk after dinner.'],
        recentQuotes: ['Joy remembered is joy kept.'],
      },
    },
  },
  {
    name: 'hard/sad entry',
    body: {
      mood: 'heavy',
      text: 'I miss my grandmother today. Found her recipe card and cried while making tea. Nobody at work knows.',
      reflectionContext: {
        recentEntries: [
          {
            date: new Date(Date.now() - 4 * 86400000).toISOString(),
            mood: 'low',
            textPreview: 'Quiet Sunday. Grief comes in waves when I hear certain songs.',
            reflectionPreview: 'Grief is love with nowhere to go — you are not broken for feeling it.',
          },
        ],
        moodPattern: {
          totalRecentEntries: 1,
          moodCounts: { low: 1 },
          mostCommonMood: 'Low',
        },
        recurringIntentions: [],
        recentTinyActions: [],
        recentQuotes: [],
      },
    },
  },
];

async function runFixture(fixture) {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(fixture.body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.log(`✗ ${fixture.name}: HTTP ${response.status}`, data.error || data.details || '');
    return;
  }

  const fields = ['reflection', 'tinyAction', 'affirmation', 'quote'];
  const missing = fields.filter((field) => !data[field]?.trim());

  if (missing.length) {
    console.log(`✗ ${fixture.name}: missing fields`, missing.join(', '));
    return;
  }

  console.log(`✓ ${fixture.name}`);
  console.log(`  reflection chars: ${data.reflection.length}`);
  console.log(`  tinyAction preview: ${data.tinyAction.slice(0, 60)}…`);
  console.log('');
}

async function main() {
  console.log(`Testing ${FIXTURES.length} fixtures against ${BASE_URL}\n`);

  for (const fixture of FIXTURES) {
    try {
      await runFixture(fixture);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`✗ ${fixture.name}: ${message}`);
    }
  }
}

main();
