import { StyleSheet, Text, View } from 'react-native';

import { MOOD_OPTIONS } from '../constants/moods';
import { colors, spacing, typography } from '../constants/theme';
import type { Mood } from '../types/entry';

interface MoodDistributionProps {
  moodCounts: Record<Mood, number>;
  total: number;
  title?: string;
}

export function MoodDistribution({
  moodCounts,
  total,
  title = 'Mood landscape',
}: MoodDistributionProps) {
  if (total === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.list}>
        {MOOD_OPTIONS.map((option) => {
          const count = moodCounts[option.value];
          if (count === 0) {
            return null;
          }

          const widthPercent = Math.max(10, Math.round((count / total) * 100));

          return (
            <View key={option.value} style={styles.row}>
              <Text style={styles.label}>{option.label}</Text>
              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    { width: `${widthPercent}%`, backgroundColor: option.color },
                  ]}
                />
              </View>
              <Text style={styles.count}>{count}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  title: {
    fontSize: typography.caption,
    color: colors.textSoft,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    width: 52,
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  track: {
    flex: 1,
    height: 10,
    backgroundColor: colors.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
  count: {
    width: 18,
    fontSize: typography.caption,
    color: colors.textSoft,
    textAlign: 'right',
  },
});
