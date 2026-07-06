import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { MOOD_OPTIONS } from '../constants/moods';
import { colors, radius, spacing, typography } from '../constants/theme';
import type { Mood } from '../types/entry';

interface EntryHistoryFiltersProps {
  query: string;
  selectedMood: Mood | null;
  onQueryChange: (value: string) => void;
  onMoodChange: (mood: Mood | null) => void;
}

export function EntryHistoryFilters({
  query,
  selectedMood,
  onQueryChange,
  onMoodChange,
}: EntryHistoryFiltersProps) {
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search entries or reflections…"
        placeholderTextColor={colors.textSoft}
        style={styles.search}
        value={query}
        onChangeText={onQueryChange}
      />

      <View style={styles.moodRow}>
        <Pressable
          onPress={() => onMoodChange(null)}
          style={[styles.moodChip, !selectedMood && styles.moodChipActive]}
        >
          <Text style={[styles.moodChipText, !selectedMood && styles.moodChipTextActive]}>
            All
          </Text>
        </Pressable>
        {MOOD_OPTIONS.map((option) => {
          const isActive = selectedMood === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onMoodChange(isActive ? null : option.value)}
              style={[
                styles.moodChip,
                isActive && { backgroundColor: option.backgroundColor, borderColor: option.color },
              ]}
            >
              <Text style={[styles.moodChipText, isActive && { color: option.color, fontWeight: '600' }]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  search: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.body,
    color: colors.text,
  },
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  moodChip: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  moodChipActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  moodChipText: {
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  moodChipTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
});
