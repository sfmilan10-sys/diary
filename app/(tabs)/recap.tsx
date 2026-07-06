import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../src/components/Button';
import { MoodBadge } from '../../src/components/MoodBadge';
import { MoodDistribution } from '../../src/components/MoodDistribution';
import { ProgressOverview } from '../../src/components/ProgressOverview';
import { RecapSectionCard } from '../../src/components/RecapSectionCard';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { WeekNavigation } from '../../src/components/WeekNavigation';
import { WeekRecapQuoteCard } from '../../src/components/WeekRecapQuoteCard';
import { useDiary } from '../../src/context/DiaryContext';
import { colors, spacing, typography } from '../../src/constants/theme';
import { analyzeWeekEntries } from '../../src/utils/analyzeWeekEntries';
import { canNavigateToNextWeek, formatWeekDateRange } from '../../src/utils/weekBounds';

export default function RecapScreen() {
  const router = useRouter();
  const { entries } = useDiary();
  const [weekOffset, setWeekOffset] = useState(0);

  const recap = useMemo(
    () => analyzeWeekEntries(entries, weekOffset),
    [entries, weekOffset],
  );

  const weekRangeLabel = formatWeekDateRange(recap.weekStart, recap.weekEnd);
  const canGoNext = canNavigateToNextWeek(weekOffset);
  const isEmptyWeek = recap.entryCount === 0;

  return (
    <ScreenContainer scroll>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Weekly Recap</Text>
        <Text style={styles.heroTitle}>Your week, gently reflected</Text>
        <Text style={styles.weekRange}>{weekRangeLabel}</Text>
      </View>

      <WeekNavigation
        weekOffset={weekOffset}
        canGoNext={canGoNext}
        onPrevious={() => setWeekOffset((current) => current - 1)}
        onNext={() => {
          if (canGoNext) {
            setWeekOffset((current) => current + 1);
          }
        }}
        onThisWeek={() => setWeekOffset(0)}
      />

      {isEmptyWeek ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>
            No entries this week. Your future self will meet you when you're ready.
          </Text>
          <Text style={styles.emptyBody}>
            Browse other weeks above, or write when it feels right.
          </Text>
        </View>
      ) : (
        <>
          <RecapSectionCard title="This week at a glance" accent>
            <Text style={styles.statLine}>
              You wrote{' '}
              <Text style={styles.statHighlight}>
                {recap.entryCount} time{recap.entryCount === 1 ? '' : 's'}
              </Text>{' '}
              this week
            </Text>
            {recap.mostCommonMood ? (
              <View style={styles.mainMoodRow}>
                <Text style={styles.mainMoodLabel}>Most common mood:</Text>
                <MoodBadge mood={recap.mostCommonMood} />
              </View>
            ) : null}
            <MoodDistribution
              moodCounts={recap.moodCounts}
              total={recap.entryCount}
              title="Mood distribution"
            />
          </RecapSectionCard>

          <RecapSectionCard title="Gentle pattern note">
            <Text style={styles.bodyText}>{recap.patternNote}</Text>
          </RecapSectionCard>

          {recap.favoriteQuote ? (
            <WeekRecapQuoteCard quote={recap.favoriteQuote} />
          ) : null}

          {recap.tinyActions.length > 0 ? (
            <RecapSectionCard title="Tiny actions Future You offered">
              <View style={styles.actionList}>
                {recap.tinyActions.map((action) => (
                  <View key={action} style={styles.actionRow}>
                    <Text style={styles.bullet}>○</Text>
                    <Text style={styles.actionText}>{action}</Text>
                  </View>
                ))}
              </View>
            </RecapSectionCard>
          ) : null}

          {recap.showedUpBy.length > 0 ? (
            <RecapSectionCard title="This week you showed up by…">
              <View style={styles.actionList}>
                {recap.showedUpBy.map((item) => (
                  <View key={item} style={styles.actionRow}>
                    <Text style={styles.bullet}>·</Text>
                    <Text style={styles.bodyText}>{item}</Text>
                  </View>
                ))}
              </View>
            </RecapSectionCard>
          ) : null}
        </>
      )}

      <ProgressOverview entries={entries} variant="full" />

      <Button
        label="Write today’s entry"
        onPress={() => router.push('/(tabs)')}
        variant="secondary"
        style={styles.footerButton}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  eyebrow: {
    fontSize: typography.caption,
    color: colors.accent,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 32,
  },
  weekRange: {
    fontSize: typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  statLine: {
    fontSize: typography.subtitle,
    color: colors.text,
    lineHeight: 28,
  },
  statHighlight: {
    fontWeight: '700',
    color: colors.accent,
  },
  mainMoodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  mainMoodLabel: {
    fontSize: typography.body,
    color: colors.textMuted,
    fontWeight: '600',
  },
  bodyText: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 26,
    flex: 1,
  },
  actionList: {
    gap: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  bullet: {
    fontSize: typography.body,
    color: colors.accent,
    lineHeight: 26,
    width: 14,
  },
  actionText: {
    flex: 1,
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 26,
  },
  emptyState: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: typography.subtitle,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 320,
  },
  emptyBody: {
    fontSize: typography.small,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  footerButton: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
});
