import type { Mood } from '../types/entry';

export interface QuoteCardTheme {
  background: string;
  backgroundAccent: string;
  blobPrimary: string;
  blobSecondary: string;
  text: string;
  textMuted: string;
  quote: string;
  footer: string;
  moodBadge: string;
  moodBadgeText: string;
  border: string;
}

export const QUOTE_CARD_THEMES: Record<Mood, QuoteCardTheme> = {
  great: {
    background: '#FDF3E8',
    backgroundAccent: '#F8E4CC',
    blobPrimary: 'rgba(232, 168, 108, 0.35)',
    blobSecondary: 'rgba(255, 220, 180, 0.5)',
    text: '#3D2E1F',
    textMuted: '#7A5E45',
    quote: '#2A2018',
    footer: '#9A7355',
    moodBadge: 'rgba(255, 255, 255, 0.55)',
    moodBadgeText: '#B8783A',
    border: 'rgba(255, 255, 255, 0.6)',
  },
  good: {
    background: '#EEF6F2',
    backgroundAccent: '#D9EDE4',
    blobPrimary: 'rgba(107, 148, 184, 0.28)',
    blobSecondary: 'rgba(140, 190, 160, 0.35)',
    text: '#243530',
    textMuted: '#4F6B62',
    quote: '#1A2B26',
    footer: '#5A7A6E',
    moodBadge: 'rgba(255, 255, 255, 0.55)',
    moodBadgeText: '#4A8A72',
    border: 'rgba(255, 255, 255, 0.65)',
  },
  okay: {
    background: '#F3F0EB',
    backgroundAccent: '#E8E2F0',
    blobPrimary: 'rgba(180, 170, 200, 0.3)',
    blobSecondary: 'rgba(220, 210, 195, 0.45)',
    text: '#3A3632',
    textMuted: '#6E6860',
    quote: '#2C2824',
    footer: '#8A8278',
    moodBadge: 'rgba(255, 255, 255, 0.5)',
    moodBadgeText: '#7A6F8A',
    border: 'rgba(255, 255, 255, 0.55)',
  },
  low: {
    background: '#E8EEF6',
    backgroundAccent: '#DDE4F2',
    blobPrimary: 'rgba(123, 111, 214, 0.22)',
    blobSecondary: 'rgba(107, 148, 184, 0.3)',
    text: '#2A3340',
    textMuted: '#556275',
    quote: '#1E2836',
    footer: '#5E6D82',
    moodBadge: 'rgba(255, 255, 255, 0.55)',
    moodBadgeText: '#6B7FD6',
    border: 'rgba(255, 255, 255, 0.6)',
  },
  heavy: {
    background: '#2A2438',
    backgroundAccent: '#1E1A2C',
    blobPrimary: 'rgba(123, 111, 214, 0.25)',
    blobSecondary: 'rgba(80, 70, 120, 0.4)',
    text: '#F0EBF8',
    textMuted: '#B8B0CC',
    quote: '#FFFFFF',
    footer: '#9A90B8',
    moodBadge: 'rgba(255, 255, 255, 0.12)',
    moodBadgeText: '#D4C8F0',
    border: 'rgba(255, 255, 255, 0.15)',
  },
};

export function getQuoteCardTheme(mood: Mood): QuoteCardTheme {
  return QUOTE_CARD_THEMES[mood];
}
