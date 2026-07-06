import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getMoodOption } from '../constants/moods';
import { colors, radius, shadows, spacing, typography } from '../constants/theme';
import type { DiaryEntry } from '../types/entry';
import {
  calculateDiaryStats,
  formatLastCheckIn,
  formatRhythmMessage,
} from '../utils/calculateDiaryStats';
import { getEmotionalWeatherSummary, getMoodCounts } from '../utils/emotionalWeather';
import { Card } from './Card';
import { MoodBadge } from './MoodBadge';
import { MoodDistribution } from './MoodDistribution';

interface ProgressOverviewProps {
  entries: DiaryEntry[];
  variant?: 'compact' | 'full';
}

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={styles.tileValue}>{value}</Text>
      {hint ? <Text style={styles.tileHint}>{hint}</Text> : null}
    </View>
  );
}

export function ProgressOverview({ entries, variant = 'full' }: ProgressOverviewProps) {
  const stats = useMemo(() => calculateDiaryStats(entries), [entries]);
  const moodCounts = useMemo(() => getMoodCounts(entries), [entries]);
  const weatherSummary = useMemo(() => getEmotionalWeatherSummary(entries), [entries]);
  const rhythmMessage = formatRhythmMessage(stats.currentStreak);

  if (stats.totalEntries === 0) {
    return (
      <Card style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>Your gentle progress</Text>
        <Text style={styles.emptyBody}>
          Your patterns will appear here once you write a few entries.
        </Text>
      </Card>
    );
  }

  const overallMoodLabel = stats.mostCommonMoodOverall
    ? getMoodOption(stats.mostCommonMoodOverall).label
    : '—';

  if (variant === 'compact') {
    return (
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Your gentle progress</Text>
        <View style={styles.compactGrid}>
          <StatTile label="Pages written" value={String(stats.totalEntries)} />
          <StatTile label="This week" value={String(stats.entriesThisWeek)} />
          <StatTile
            label="Current rhythm"
            value={`${stats.currentStreak} day${stats.currentStreak === 1 ? '' : 's'}`}
          />
          <StatTile
            label="Last check-in"
            value={formatLastCheckIn(stats.lastEntryDate)}
          />
        </View>
        <Text style={styles.rhythmNote}>{rhythmMessage}</Text>
        <Text style={styles.weatherLine}>{weatherSummary}</Text>
      </Card>
    );
  }

  return (
    <View style={styles.fullWrapper}>
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Your gentle progress</Text>
        <View style={styles.fullGrid}>
          <StatTile label="Pages written" value={String(stats.totalEntries)} />
          <StatTile label="This week" value={String(stats.entriesThisWeek)} />
          <StatTile
            label="Current rhythm"
            value={`${stats.currentStreak} day${stats.currentStreak === 1 ? '' : 's'}`}
            hint={rhythmMessage}
          />
          <StatTile
            label="Longest rhythm"
            value={`${stats.longestStreak} day${stats.longestStreak === 1 ? '' : 's'}`}
          />
          <StatTile
            label="Days you showed up"
            value={String(stats.uniqueDays)}
          />
          <StatTile
            label="Last check-in"
            value={formatLastCheckIn(stats.lastEntryDate)}
          />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Most common mood</Text>
        <View style={styles.moodRow}>
          {stats.mostCommonMoodOverall ? (
            <MoodBadge mood={stats.mostCommonMoodOverall} />
          ) : null}
          <Text style={styles.moodCaption}>Overall: {overallMoodLabel}</Text>
        </View>
        {stats.mostCommonMoodThisWeek &&
        stats.mostCommonMoodThisWeek !== stats.mostCommonMoodOverall ? (
          <View style={styles.moodRow}>
            <MoodBadge mood={stats.mostCommonMoodThisWeek} />
            <Text style={styles.moodCaption}>This week</Text>
          </View>
        ) : stats.mostCommonMoodThisWeek ? (
          <Text style={styles.moodCaption}>This week matches your overall pattern.</Text>
        ) : null}
        <MoodDistribution moodCounts={moodCounts} total={stats.totalEntries} />
      </Card>

      <Card style={[styles.card, styles.weatherCard]}>
        <Text style={styles.sectionTitle}>Emotional weather</Text>
        <Text style={styles.weatherText}>{weatherSummary}</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  fullWrapper: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  card: {
    gap: spacing.md,
    ...shadows.soft,
  },
  emptyCard: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
    ...shadows.soft,
  },
  emptyTitle: {
    fontSize: typography.subtitle,
    fontWeight: '600',
    color: colors.text,
  },
  emptyBody: {
    fontSize: typography.small,
    color: colors.textMuted,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: typography.caption,
    color: colors.accent,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  compactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  fullGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tile: {
    width: '47%',
    backgroundColor: colors.backgroundAccent,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
    minWidth: 140,
    flexGrow: 1,
  },
  tileLabel: {
    fontSize: typography.caption,
    color: colors.textSoft,
    fontWeight: '600',
  },
  tileValue: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  tileHint: {
    fontSize: typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },
  rhythmNote: {
    fontSize: typography.small,
    color: colors.textMuted,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  weatherLine: {
    fontSize: typography.small,
    color: colors.text,
    lineHeight: 22,
  },
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  moodCaption: {
    fontSize: typography.small,
    color: colors.textMuted,
  },
  weatherCard: {
    backgroundColor: colors.accentSoft,
    borderColor: 'transparent',
  },
  weatherText: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 26,
  },
});
