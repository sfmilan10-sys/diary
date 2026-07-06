import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MOOD_OPTIONS } from '../constants/moods';
import { colors, radius, shadows, spacing, typography } from '../constants/theme';
import type { Mood } from '../types/entry';

interface MoodSelectorProps {
  selectedMood: Mood;
  onSelect: (mood: Mood) => void;
}

export function MoodSelector({ selectedMood, onSelect }: MoodSelectorProps) {
  return (
    <View style={styles.container}>
      {MOOD_OPTIONS.map((option) => {
        const isSelected = option.value === selectedMood;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(option.value)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: isSelected ? option.backgroundColor : colors.surface,
                borderColor: isSelected ? option.color : colors.border,
              },
              isSelected && styles.chipSelected,
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.dot, { backgroundColor: option.color }]} />
            <View style={styles.labelGroup}>
              <Text
                style={[
                  styles.label,
                  isSelected && { color: colors.text, fontWeight: '700' },
                ]}
              >
                {option.label}
              </Text>
              <Text
                style={[
                  styles.description,
                  isSelected && { color: colors.textMuted },
                ]}
              >
                {option.description}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    minWidth: '47%',
    flexGrow: 1,
  },
  chipSelected: {
    borderWidth: 2,
    ...shadows.soft,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
  },
  labelGroup: {
    gap: 2,
    flex: 1,
  },
  label: {
    fontSize: typography.small,
    color: colors.textMuted,
  },
  description: {
    fontSize: typography.caption,
    color: colors.textSoft,
    textTransform: 'lowercase',
  },
  pressed: {
    opacity: 0.88,
  },
});
