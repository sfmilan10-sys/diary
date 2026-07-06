type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'lateNight';

const GREETINGS: Record<TimeOfDay, string> = {
  morning: 'Good morning',
  afternoon: 'Good afternoon',
  evening: 'Good evening',
  lateNight: 'Still here with you',
};

const SUPPORTIVE_LINES = [
  'What should Future You remember about today?',
  'A few honest lines are enough.',
  'Start where you are.',
  'You do not need the perfect words.',
  'One honest page is a gift to tomorrow-you.',
] as const;

function getTimeOfDay(date: Date): TimeOfDay {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) {
    return 'morning';
  }
  if (hour >= 12 && hour < 17) {
    return 'afternoon';
  }
  if (hour >= 17 && hour < 22) {
    return 'evening';
  }
  return 'lateNight';
}

function dayIndex(date: Date): number {
  return date.getFullYear() * 372 + date.getMonth() * 31 + date.getDate();
}

export function getHomeGreeting(date: Date = new Date()): {
  greeting: string;
  supportiveLine: string;
} {
  const timeOfDay = getTimeOfDay(date);
  const supportiveLine =
    SUPPORTIVE_LINES[dayIndex(date) % SUPPORTIVE_LINES.length];

  return {
    greeting: GREETINGS[timeOfDay],
    supportiveLine,
  };
}
