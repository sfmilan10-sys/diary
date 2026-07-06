import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../constants/theme';

interface CharacterCounterProps {
  length: number;
  max: number;
  /** Counter stays hidden until length passes this threshold. */
  showThreshold: number;
}

export function CharacterCounter({ length, max, showThreshold }: CharacterCounterProps) {
  if (length <= showThreshold) {
    return null;
  }

  const atLimit = length >= max;

  return (
    <View style={styles.row}>
      <Text style={styles.hint}>A little shorter will reflect better.</Text>
      <Text style={[styles.count, atLimit && styles.countAtLimit]}>
        {length} / {max}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  hint: {
    flex: 1,
    fontSize: typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  count: {
    fontSize: typography.caption,
    color: colors.textSoft,
  },
  countAtLimit: {
    color: colors.error,
    fontWeight: '600',
  },
});
