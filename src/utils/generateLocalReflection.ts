import type { LocalReflection, Mood } from '../types/entry';
import type { ReflectionContext } from '../types/reflection';
import { getMoodOption } from '../constants/moods';
import { buildCrisisLocalReflection, detectPossibleCrisis } from './crisisSupport';

type EntryTheme =
  | 'work'
  | 'relationship'
  | 'anxiety'
  | 'tired'
  | 'gratitude'
  | 'lonely'
  | 'growth'
  | 'general';

interface MoodContent {
  reflections: string[];
  tinyActions: string[];
  affirmations: string[];
  quotes: string[];
  themeReflections: Partial<Record<EntryTheme, string>>;
}

const MOOD_CONTENT: Record<Mood, MoodContent> = {
  great: {
    reflections: [
      'Today had real light in it. Notice what is already working — not as a reason to perform harder, but as proof that you can feel this way again.',
      'Something in you showed up today. Hold that gently. Joy does not have to be loud to be real.',
      'You are building a life in moments like this. Memory is how good days become evidence, not accidents.',
    ],
    tinyActions: [
      'Name one thing that went well today and keep it somewhere you will see tomorrow morning.',
      'Send a short message of thanks to someone who made today feel lighter.',
      'Take five minutes to savor one small pleasure again before the day ends.',
    ],
    affirmations: [
      'I can let good days count without needing to earn them.',
      'What is working in my life is allowed to be seen.',
      'I am becoming someone who notices light without rushing past it.',
    ],
    quotes: [
      'Joy is not a distraction from growth — it is part of it.',
      'Not every day has to prove something. Some days can simply be true.',
      'Light remembered is light kept.',
    ],
    themeReflections: {
      work: 'The effort you put in is showing. Steady care matters more than perfect outcomes.',
      gratitude: 'Gratitude today is not naïve — it is you training your attention toward what sustains you.',
      growth: 'You are further along than you think. Progress often looks quiet before it feels obvious.',
    },
  },
  good: {
    reflections: [
      'Today was warm in a steady way. Good days are often built from small, unglamorous choices that still count.',
      'There is momentum here, even if it feels soft. You do not need to turn a good day into a perfect streak.',
      'You are moving in a direction that fits you more than you give yourself credit for. Keep the pace kind, not urgent.',
    ],
    tinyActions: [
      'Choose one habit from today that felt good and repeat it tomorrow in a smaller version.',
      'Write one sentence about what you want to carry into tomorrow from today.',
      'Step outside for a few minutes and let your body register that today was okay.',
    ],
    affirmations: [
      'A good day does not have to become a great day to matter.',
      'I can appreciate progress without demanding perfection.',
      'I am allowed to keep momentum gently.',
    ],
    quotes: [
      'Warmth is a form of wisdom when you let yourself receive it.',
      'Enough is not the enemy of more — it is the foundation of it.',
      'Steady counts.',
    ],
    themeReflections: {
      work: 'You handled more than you are measuring. A good day at work can include rest afterward.',
      relationship: 'Connection helped today. Keep investing in people who feel safe.',
      tired: 'Even on a good day, tiredness is valid. You can be doing well and still need softness tonight.',
    },
  },
  okay: {
    reflections: [
      'An okay day is still a human day. Not every page in your story needs drama or triumph. Neutral can be a kind of rest.',
      'You do not have to judge an average day into something else. Sometimes the win is simply that you stayed with yourself honestly.',
      'Okay is not a failure of feeling — it is room to breathe.',
    ],
    tinyActions: [
      'Do one small thing tonight that signals care — water, a shower, or tidying one corner.',
      'Pick a 10-minute comfort that costs nothing: music, a walk, or quiet.',
      'Write one honest line about what you need tomorrow, without fixing everything tonight.',
    ],
    affirmations: [
      'I do not have to upgrade my feelings to deserve rest.',
      'An ordinary day can still be part of a meaningful life.',
      'I am allowed to be in the middle of becoming.',
    ],
    quotes: [
      'Not every day has to prove something.',
      'Neutral is sometimes your nervous system asking for peace.',
      'You are not behind — you are in process.',
    ],
    themeReflections: {
      anxiety: 'The background hum of worry does not erase the okayness of today. You can hold both.',
      work: 'Showing up on an okay day still counts. Consistency matters more than fireworks.',
      general: 'If nothing felt remarkable, that might be what your body needed.',
    },
  },
  low: {
    reflections: [
      'Today felt low, and I want you to hear this first: you are not failing for feeling this way. Low days are part of a real life.',
      'You wrote on a hard day. That matters. You did not disappear from yourself completely — that is a quiet form of courage.',
      'When energy is thin, the goal is not to become fearless. The goal is to stay with yourself kindly.',
    ],
    tinyActions: [
      'Choose the smallest caring action available: eat something, change clothes, or open a window.',
      'Text one safe person a simple “today was hard” — no explanation required.',
      'Set a five-minute timer and rest without judging how you feel when it ends.',
    ],
    affirmations: [
      'A low day does not define my future.',
      'I can be gentle with myself without fixing everything tonight.',
      'Needing support is human, not a character flaw.',
    ],
    quotes: [
      'If today felt heavy, the goal is to stay with yourself kindly.',
      'You are allowed to move slowly on days like this.',
      'Healing rarely looks impressive from the outside.',
    ],
    themeReflections: {
      lonely: 'Loneliness on a low day can feel louder than truth. You still belong.',
      tired: 'Exhaustion and low mood often travel together. Rest is maintenance, not giving up.',
      anxiety: 'Worry on a low day shrinks your world. You do not have to solve the whole future.',
    },
  },
  heavy: {
    reflections: [
      'This was a heavy day. You do not have to carry everything at once, and you do not have to make sense of it all before you rest.',
      'If today felt like too much, your only job tonight may be to remain a little kinder to yourself than the day was.',
      'Heavy days are not punishments. They are weather.',
    ],
    tinyActions: [
      'Put one burden down for tonight — defer a decision, silence non-urgent notifications, or close the laptop.',
      'Wrap yourself in something physically comforting and breathe slowly for one minute.',
      'If it is safe, tell one trusted person: “I had a heavy day and I do not need advice, just to say it.”',
    ],
    affirmations: [
      'I do not have to carry the whole weight of my life tonight.',
      'Feeling heavy does not mean I am failing.',
      'I deserve softness on the days that cost me the most.',
    ],
    quotes: [
      'You do not have to earn rest on the days that hurt.',
      'Tomorrow can be lighter without you forcing it tonight.',
      'Staying is a form of strength.',
    ],
    themeReflections: {
      anxiety: 'When everything feels urgent, most of this can wait until you are steadier.',
      lonely: 'Heavy and alone is a painful combination. You still belong.',
      relationship: 'If someone hurt you today, your pain does not need to be minimized.',
    },
  },
};

const THEME_KEYWORDS: Record<EntryTheme, string[]> = {
  work: ['work', 'job', 'boss', 'career', 'office', 'meeting', 'project', 'deadline', 'colleague'],
  relationship: [
    'friend',
    'family',
    'partner',
    'love',
    'relationship',
    'mom',
    'dad',
    'husband',
    'wife',
    'boyfriend',
    'girlfriend',
  ],
  anxiety: ['anxious', 'anxiety', 'worry', 'worried', 'stress', 'stressed', 'panic', 'overwhelm'],
  tired: ['tired', 'exhausted', 'drained', 'burnout', 'sleep', 'fatigue', 'weary'],
  gratitude: ['grateful', 'thankful', 'gratitude', 'appreciate', 'blessed', 'lucky'],
  lonely: ['lonely', 'alone', 'isolated', 'disconnected', 'miss'],
  growth: ['goal', 'dream', 'future', 'grow', 'learning', 'habit', 'change', 'becoming'],
  general: [],
};

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function pick<T>(items: T[], seed: number): T {
  return items[seed % items.length];
}

function detectThemes(text: string): EntryTheme[] {
  const lower = text.toLowerCase();
  const themes = (Object.keys(THEME_KEYWORDS) as EntryTheme[]).filter((theme) => {
    if (theme === 'general') {
      return false;
    }
    return THEME_KEYWORDS[theme].some((keyword) => lower.includes(keyword));
  });

  return themes.length > 0 ? themes : ['general'];
}

function extractMeaningfulPhrase(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  const sentenceMatch = trimmed.match(/^[^.!?\n]+[.!?]?/);
  const candidate = (sentenceMatch?.[0] ?? trimmed).trim();

  if (candidate.length < 8) {
    return null;
  }

  return candidate.length > 90 ? `${candidate.slice(0, 90).trimEnd()}…` : candidate;
}

function buildContextNote(mood: Mood, context?: ReflectionContext): string | null {
  if (!context || context.moodPattern.totalRecentEntries === 0) {
    return null;
  }

  const notes: string[] = [];
  const currentLabel = getMoodOption(mood).label.toLowerCase();
  const recentCommon = context.moodPattern.mostCommonMood?.toLowerCase();

  if (recentCommon && recentCommon !== currentLabel && context.moodPattern.totalRecentEntries >= 2) {
    notes.push(
      `Lately your entries have leaned ${recentCommon}; today feels more ${currentLabel}. That shift is worth noticing without judging it.`,
    );
  }

  const recurring = context.recurringIntentions[0];
  if (recurring) {
    notes.push(`You have been returning to the intention “${recurring}” — that thread is still alive in you.`);
  }

  const recentAction = context.recentTinyActions[0];
  if (recentAction && hashString(recentAction) % 2 === 0) {
    notes.push(`Last time, Future You suggested something small. Today can be a fresh page, not a test.`);
  }

  return notes[0] ?? null;
}

function personalizeReflection(
  base: string,
  text: string,
  mood: Mood,
  context?: ReflectionContext,
): string {
  const trimmed = text.trim();
  const themes = detectThemes(trimmed);
  const seed = hashString(`${mood}:${trimmed}`);
  const theme = themes[0];
  const themeLine = MOOD_CONTENT[mood].themeReflections[theme];
  const phrase = extractMeaningfulPhrase(trimmed);
  const contextNote = buildContextNote(mood, context);

  const parts: string[] = [];

  if (phrase) {
    parts.push(`You named something real today — “${phrase}” — and I want you to know it landed.`);
  } else {
    parts.push('You showed up honestly today, and that matters.');
  }

  if (themeLine) {
    parts.push(themeLine);
  }

  parts.push(base);

  if (contextNote) {
    parts.push(contextNote);
  } else if (seed % 4 === 0) {
    parts.push('I am not asking you to fix the whole week tonight — just to stay in contact with yourself.');
  }

  return parts.join(' ');
}

function buildContextualTinyAction(
  mood: Mood,
  text: string,
  intention: string | undefined,
  context: ReflectionContext | undefined,
  seed: number,
): string {
  const themes = detectThemes(text);
  const theme = themes[0];
  const phrase = extractMeaningfulPhrase(text);

  if (intention?.trim()) {
    const short = intention.trim().length > 60
      ? `${intention.trim().slice(0, 60).trimEnd()}…`
      : intention.trim();
    return `Spend 10 minutes on your intention: ${short}. Keep it small enough for a tired day.`;
  }

  if (theme === 'tired' || theme === 'anxiety') {
    return 'Set a timer for 8 minutes: one physical comfort (water, stretch, or fresh air) before you decide anything else.';
  }

  if (phrase && seed % 2 === 0) {
    return `Write one follow-up sentence about “${phrase.slice(0, 40).trimEnd()}” — what you needed when you wrote it.`;
  }

  if (context?.recentTinyActions[0]) {
    return pick(MOOD_CONTENT[mood].tinyActions, seed + 1);
  }

  return pick(MOOD_CONTENT[mood].tinyActions, seed + 1);
}

function buildContextualQuote(
  mood: Mood,
  text: string,
  seed: number,
): string {
  const phrase = extractMeaningfulPhrase(text);
  const moodWord = getMoodOption(mood).label.toLowerCase();

  if (phrase && phrase.length > 20) {
    const shortPhrase = phrase.length > 50 ? `${phrase.slice(0, 50).trimEnd()}…` : phrase;
    return `What you wrote — “${shortPhrase}” — is part of who you are becoming.`;
  }

  return pick(MOOD_CONTENT[mood].quotes, seed + 3);
}

function applyIntention(
  result: LocalReflection,
  intention: string | undefined,
): LocalReflection {
  const trimmed = intention?.trim();
  if (!trimmed) {
    return result;
  }

  const shortIntention =
    trimmed.length > 80 ? `${trimmed.slice(0, 80).trimEnd()}…` : trimmed;

  return {
    ...result,
    reflection: `${result.reflection} You named tomorrow’s intention — “${shortIntention}”. Let it be a small vote for yourself, not a test.`,
    tinyAction: `Honor your intention gently: ${shortIntention}. Keep it small enough that you would still do it on a tired day.`,
  };
}

export function generateLocalReflection(
  mood: Mood,
  text: string,
  intention?: string,
  context?: ReflectionContext,
): LocalReflection {
  const trimmed = text.trim();

  if (detectPossibleCrisis(trimmed)) {
    return buildCrisisLocalReflection();
  }

  const seed = hashString(`${mood}:${trimmed}:${intention?.trim() ?? ''}`);
  const content = MOOD_CONTENT[mood];

  const baseReflection = pick(content.reflections, seed);
  const reflection = personalizeReflection(baseReflection, trimmed, mood, context);

  const result: LocalReflection = {
    reflection,
    tinyAction: buildContextualTinyAction(mood, trimmed, intention, context, seed),
    affirmation: pick(content.affirmations, seed + 2),
    quote: buildContextualQuote(mood, trimmed, seed),
  };

  return applyIntention(result, intention);
}
