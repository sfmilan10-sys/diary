import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { EntryCard } from '../../src/components/EntryCard';
import { EntryHistoryFilters } from '../../src/components/EntryHistoryFilters';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { useDiary } from '../../src/context/DiaryContext';
import { colors, spacing, typography } from '../../src/constants/theme';
import type { Mood } from '../../src/types/entry';
import { filterEntries } from '../../src/utils/filterEntries';

export default function TimelineScreen() {
  const router = useRouter();
  const { entries } = useDiary();
  const [query, setQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);

  const filteredEntries = useMemo(
    () => filterEntries(entries, { query, mood: selectedMood }),
    [entries, query, selectedMood],
  );

  const hasEntries = entries.length > 0;
  const hasFilteredResults = filteredEntries.length > 0;

  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Timeline</Text>
        <Text style={styles.subtitle}>Your reflections, gathered gently.</Text>
      </View>

      {hasEntries ? (
        <>
          <EntryHistoryFilters
            query={query}
            selectedMood={selectedMood}
            onQueryChange={setQuery}
            onMoodChange={setSelectedMood}
          />

          {hasFilteredResults ? (
            <View style={styles.list}>
              {filteredEntries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onPress={() => router.push(`/entry/${entry.id}`)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyFilter}>
              <Text style={styles.emptyFilterText}>
                No entries match this search or mood filter.
              </Text>
            </View>
          )}
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>
            Your future self is waiting for your first entry.
          </Text>
          <Text style={styles.emptyBody}>
            Save an entry from Home to begin your diary.
          </Text>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.small,
    color: colors.textMuted,
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  emptyFilter: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyFilterText: {
    fontSize: typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.subtitle,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 26,
  },
  emptyBody: {
    fontSize: typography.small,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
});
