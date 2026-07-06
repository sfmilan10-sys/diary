export const colors = {
  background: '#F7F4F0',
  backgroundAccent: '#EFE9E3',
  surface: '#FFFFFF',
  text: '#2A2A2A',
  textMuted: '#6B6560',
  textSoft: '#8A847C',
  border: '#E6DFD6',
  accent: '#7B6FD6',
  accentSoft: '#E8E4F8',
  coral: '#D4897A',
  coralSoft: '#F5E8E4',
  blue: '#6B94B8',
  blueSoft: '#E4EDF5',
  shadow: '#2A2A2A',
  disabled: '#B8B2AA',
  error: '#C45C5C',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  full: 999,
} as const;

export const typography = {
  hero: 32,
  title: 24,
  subtitle: 17,
  body: 16,
  small: 14,
  caption: 12,
} as const;

export const shadows = {
  card: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  soft: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
} as const;
