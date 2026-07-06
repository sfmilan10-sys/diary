import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../constants/theme';
import type { DiaryEntry } from '../types/entry';
import { LEGACY_QUOTE } from '../utils/entryDefaults';
import { formatEntryDate, truncateText } from '../utils/format';
import { Button } from './Button';
import { Card } from './Card';
import { MoodBadge } from './MoodBadge';

interface LastReflectionPreviewProps {
  entries: DiaryEntry[];
  onRevisit: (entryId: string) => void;
}

export function LastReflectionPreview({ entries, onRevisit }: LastReflectionPreviewProps) {
  const latest = useMemo(() => {
    const withReflection = entries
      .filter((entry) => entry.reflection?.trim())
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    return withReflection[0] ?? null;
  }, [entries]);

  if (!latest) {
    return null;
  }

  const quote = latest.quote?.trim();
  const showQuote = quote && quote !== LEGACY_QUOTE;
  const preview = showQuote
    ? truncateText(quote, 120)
    : truncateText(latest.reflection, 120);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Last reflection</Text>
        <Text style={styles.date}>{formatEntryDate(latest.createdAt)}</Text>
      </View>

      <MoodBadge mood={latest.mood} />

      <Text style={styles.preview}>
        {showQuote ? `“${preview}”` : preview}
      </Text>

      <Button
        label="Revisit"
        onPress={() => onRevisit(latest.id)}
        variant="secondary"
        style={styles.button}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.caption,
    color: colors.accent,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  date: {
    fontSize: typography.caption,
    color: colors.textSoft,
  },
  preview: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  button: {
    alignSelf: 'flex-start',
  },
});
