import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../constants/theme';
import type { DiaryEntry } from '../types/entry';
import {
  calculateDiaryStats,
  formatRhythmMessage,
} from '../utils/calculateDiaryStats';
import { filterEntriesInWeek } from '../utils/weekBounds';
import { Button } from './Button';
import { Card } from './Card';

interface RecentActivityCardProps {
  entries: DiaryEntry[];
  onOpenRecap: () => void;
  onOpenTimeline: () => void;
}

export function RecentActivityCard({
  entries,
  onOpenRecap,
  onOpenTimeline,
}: RecentActivityCardProps) {
  const stats = useMemo(() => calculateDiaryStats(entries), [entries]);
  const entriesThisWeek = useMemo(
    () => filterEntriesInWeek(entries, 0).length,
    [entries],
  );
  const rhythmMessage = formatRhythmMessage(stats.currentStreak);

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Recent activity</Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{entriesThisWeek}</Text>
          <Text style={styles.statLabel}>This week</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {stats.currentStreak > 0 ? stats.currentStreak : '—'}
          </Text>
          <Text style={styles.statLabel}>Day rhythm</Text>
        </View>
      </View>

      <Text style={styles.rhythmNote}>{rhythmMessage}</Text>

      <View style={styles.links}>
        <Button label="Weekly recap" onPress={onOpenRecap} variant="ghost" />
        <Button label="Timeline" onPress={onOpenTimeline} variant="ghost" />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.caption,
    color: colors.accent,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAccent,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.caption,
    color: colors.textSoft,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
  },
  rhythmNote: {
    fontSize: typography.small,
    color: colors.textMuted,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
