import type { Mood } from '../types/entry';
import { colors } from './theme';

export interface MoodOption {
  value: Mood;
  label: string;
  description: string;
  color: string;
  backgroundColor: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  {
    value: 'great',
    label: 'Great',
    description: 'light',
    color: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  {
    value: 'good',
    label: 'Good',
    description: 'steady',
    color: colors.blue,
    backgroundColor: colors.blueSoft,
  },
  {
    value: 'okay',
    label: 'Okay',
    description: 'neutral',
    color: '#9A8F7A',
    backgroundColor: '#F0EBE3',
  },
  {
    value: 'low',
    label: 'Low',
    description: 'tender',
    color: colors.coral,
    backgroundColor: colors.coralSoft,
  },
  {
    value: 'heavy',
    label: 'Heavy',
    description: 'overwhelmed',
    color: '#6B5B7A',
    backgroundColor: '#EDE8F0',
  },
];

export function getMoodOption(mood: Mood): MoodOption {
  return MOOD_OPTIONS.find((option) => option.value === mood) ?? MOOD_OPTIONS[2];
}
