import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../constants/theme';

interface WeekNavigationProps {
  weekOffset: number;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onThisWeek: () => void;
}

export function WeekNavigation({
  weekOffset,
  canGoNext,
  onPrevious,
  onNext,
  onThisWeek,
}: WeekNavigationProps) {
  const isCurrentWeek = weekOffset === 0;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous week"
          onPress={onPrevious}
          style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
        >
          <Text style={styles.navButtonText}>← Previous</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next week"
          disabled={!canGoNext}
          onPress={onNext}
          style={({ pressed }) => [
            styles.navButton,
            !canGoNext && styles.navButtonDisabled,
            pressed && canGoNext && styles.pressed,
          ]}
        >
          <Text style={[styles.navButtonText, !canGoNext && styles.navButtonTextDisabled]}>
            Next →
          </Text>
        </Pressable>
      </View>

      {!isCurrentWeek ? (
        <Pressable
          accessibilityRole="button"
          onPress={onThisWeek}
          style={({ pressed }) => [styles.thisWeekButton, pressed && styles.pressed]}
        >
          <Text style={styles.thisWeekText}>This week</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  navButton: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.45,
  },
  navButtonText: {
    fontSize: typography.small,
    color: colors.text,
    fontWeight: '600',
  },
  navButtonTextDisabled: {
    color: colors.textSoft,
  },
  thisWeekButton: {
    alignSelf: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  thisWeekText: {
    fontSize: typography.small,
    color: colors.accent,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.88,
  },
});
