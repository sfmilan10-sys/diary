import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  applyPromptToText,
  getDailyPrompt,
  STARTER_PROMPTS,
} from '../constants/writingPrompts';
import { colors, radius, spacing, typography } from '../constants/theme';

interface WritingPromptsProps {
  currentText: string;
  onApplyPrompt: (text: string) => void;
}

export function WritingPrompts({ currentText, onApplyPrompt }: WritingPromptsProps) {
  const dailyPrompt = getDailyPrompt();

  const handlePromptPress = (prompt: string) => {
    onApplyPrompt(applyPromptToText(currentText, prompt));
  };

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        onPress={() => handlePromptPress(dailyPrompt)}
        style={({ pressed }) => [styles.dailyCard, pressed && styles.pressed]}
      >
        <Text style={styles.dailyLabel}>Today’s gentle prompt</Text>
        <Text style={styles.dailyPrompt}>{dailyPrompt}</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Need a starting point?</Text>
      <View style={styles.chips}>
        {STARTER_PROMPTS.map((prompt) => (
          <Pressable
            key={prompt}
            accessibilityRole="button"
            onPress={() => handlePromptPress(prompt)}
            style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
          >
            <Text style={styles.chipText}>{prompt}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  dailyCard: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: spacing.xs,
  },
  dailyLabel: {
    fontSize: typography.caption,
    color: colors.accent,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  dailyPrompt: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: typography.caption,
    color: colors.textSoft,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    fontSize: typography.small,
    color: colors.textMuted,
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.85,
  },
});
