import { StyleSheet, Text, View } from 'react-native';

import { getMoodOption } from '../constants/moods';
import { getQuoteCardTheme } from '../constants/quoteCardThemes';
import { radius, shadows, spacing, typography } from '../constants/theme';
import type { Mood } from '../types/entry';

const FALLBACK_QUOTE = 'Your future self is still writing this one.';

interface QuoteCardVisualProps {
  quote?: string;
  mood: Mood;
  dateLabel: string;
}

export function QuoteCardVisual({ quote, mood, dateLabel }: QuoteCardVisualProps) {
  const theme = getQuoteCardTheme(mood);
  const moodOption = getMoodOption(mood);
  const displayQuote = quote?.trim() || FALLBACK_QUOTE;

  return (
    <View style={[styles.wrapper, shadows.card]}>
      <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <View style={[styles.baseAccent, { backgroundColor: theme.backgroundAccent }]} />
        <View style={[styles.blob, styles.blobTopRight, { backgroundColor: theme.blobPrimary }]} />
        <View style={[styles.blob, styles.blobBottomLeft, { backgroundColor: theme.blobSecondary }]} />
        <View style={[styles.blob, styles.blobCenter, { backgroundColor: theme.blobPrimary }]} />

        <View style={styles.content}>
          <View style={styles.topRow}>
            <View style={[styles.moodBadge, { backgroundColor: theme.moodBadge }]}>
              <View style={[styles.moodDot, { backgroundColor: moodOption.color }]} />
              <Text style={[styles.moodLabel, { color: theme.moodBadgeText }]}>
                {moodOption.label}
              </Text>
            </View>
            <Text style={[styles.date, { color: theme.textMuted }]}>{dateLabel}</Text>
          </View>

          <Text style={[styles.quoteMark, { color: theme.moodBadgeText }]}>“</Text>
          <Text style={[styles.quote, { color: theme.quote }]}>{displayQuote}</Text>
          <Text style={[styles.quoteMarkEnd, { color: theme.moodBadgeText }]}>”</Text>

          <View style={styles.footer}>
            <View style={[styles.footerLine, { backgroundColor: theme.border }]} />
            <Text style={[styles.appName, { color: theme.footer }]}>Future Self Diary</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
  },
  card: {
    borderRadius: radius.lg + 4,
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 420,
  },
  baseAccent: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.7,
  },
  blob: {
    position: 'absolute',
    borderRadius: radius.full,
  },
  blobTopRight: {
    width: 180,
    height: 180,
    top: -50,
    right: -40,
  },
  blobBottomLeft: {
    width: 220,
    height: 220,
    bottom: -70,
    left: -60,
  },
  blobCenter: {
    width: 120,
    height: 120,
    top: '42%',
    right: 20,
    opacity: 0.5,
  },
  content: {
    padding: spacing.xl,
    paddingVertical: spacing.xl + 8,
    minHeight: 420,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
  },
  moodDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  moodLabel: {
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  date: {
    fontSize: typography.caption,
    fontWeight: '500',
  },
  quoteMark: {
    fontSize: 48,
    lineHeight: 48,
    fontWeight: '300',
    marginTop: spacing.lg,
    opacity: 0.5,
  },
  quote: {
    fontSize: typography.title,
    lineHeight: 34,
    fontWeight: '600',
    letterSpacing: -0.3,
    marginTop: spacing.sm,
    flex: 1,
  },
  quoteMarkEnd: {
    fontSize: 48,
    lineHeight: 48,
    fontWeight: '300',
    alignSelf: 'flex-end',
    opacity: 0.5,
    marginTop: spacing.md,
  },
  footer: {
    marginTop: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  footerLine: {
    width: 48,
    height: 1,
  },
  appName: {
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
});
