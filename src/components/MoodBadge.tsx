import { StyleSheet, Text, View } from 'react-native';

import { getMoodOption } from '../constants/moods';
import { radius, spacing, typography } from '../constants/theme';
import type { Mood } from '../types/entry';

interface MoodBadgeProps {
  mood: Mood;
}

export function MoodBadge({ mood }: MoodBadgeProps) {
  const option = getMoodOption(mood);

  return (
    <View style={[styles.badge, { backgroundColor: option.backgroundColor }]}>
      <View style={[styles.dot, { backgroundColor: option.color }]} />
      <Text style={[styles.label, { color: option.color }]}>{option.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  label: {
    fontSize: typography.caption,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
