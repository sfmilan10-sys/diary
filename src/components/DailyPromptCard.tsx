import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../constants/theme';
import { applyPromptToText, getDailyPrompt } from '../utils/dailyPrompt';
import { Button } from './Button';
import { Card } from './Card';

interface DailyPromptCardProps {
  currentText: string;
  onApplyPrompt: (text: string) => void;
}

export function DailyPromptCard({ currentText, onApplyPrompt }: DailyPromptCardProps) {
  const dailyPrompt = getDailyPrompt();

  const handleUsePrompt = () => {
    onApplyPrompt(applyPromptToText(currentText, dailyPrompt));
  };

  return (
    <Card style={styles.card}>
      <Text style={styles.label}>Today's prompt</Text>
      <Text style={styles.prompt}>{dailyPrompt}</Text>
      <Button
        label="Use this prompt"
        onPress={handleUsePrompt}
        variant="secondary"
        style={styles.button}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    marginBottom: spacing.md,
    backgroundColor: colors.accentSoft,
    borderColor: 'transparent',
  },
  label: {
    fontSize: typography.caption,
    color: colors.accent,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  prompt: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  button: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
});
