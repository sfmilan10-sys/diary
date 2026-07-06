import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../constants/theme';
import type { DiaryEntry } from '../types/entry';
import { LEGACY_QUOTE } from '../utils/entryDefaults';
import { formatEntryDate, formatEntryTime, truncateText } from '../utils/format';
import { Card } from './Card';
import { MoodBadge } from './MoodBadge';

interface EntryCardProps {
  entry: DiaryEntry;
  onPress?: () => void;
}

export function EntryCard({ entry, onPress }: EntryCardProps) {
  const quote = entry.quote?.trim() || LEGACY_QUOTE;
  const reflectionPreview = entry.reflection?.trim();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <Card style={styles.card}>
        <View style={styles.header}>
          <MoodBadge mood={entry.mood} />
          <View style={styles.dateGroup}>
            <Text style={styles.date}>{formatEntryDate(entry.createdAt)}</Text>
            <Text style={styles.time}>{formatEntryTime(entry.createdAt)}</Text>
          </View>
        </View>

        <Text style={styles.preview}>{truncateText(entry.text, 120)}</Text>

        {reflectionPreview ? (
          <View style={styles.reflectionBlock}>
            <Text style={styles.reflectionLabel}>Future Me</Text>
            <Text style={styles.reflectionPreview}>
              {truncateText(reflectionPreview, 100)}
            </Text>
          </View>
        ) : null}

        <View style={styles.quotePreview}>
          <Text style={styles.quoteText}>{truncateText(quote, 72)}</Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.92,
  },
  card: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  dateGroup: {
    alignItems: 'flex-end',
    gap: 2,
  },
  date: {
    fontSize: typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
  time: {
    fontSize: typography.caption,
    color: colors.textSoft,
  },
  preview: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 24,
  },
  reflectionBlock: {
    gap: spacing.xs,
  },
  reflectionLabel: {
    fontSize: typography.caption,
    color: colors.accent,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  reflectionPreview: {
    fontSize: typography.small,
    color: colors.textMuted,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  quotePreview: {
    borderLeftWidth: 2,
    borderLeftColor: colors.accent,
    paddingLeft: spacing.md,
  },
  quoteText: {
    fontSize: typography.caption,
    color: colors.textSoft,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});
