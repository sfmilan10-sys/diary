import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import * as Clipboard from 'expo-clipboard';

import { colors, spacing, typography } from '../constants/theme';
import { RecapSectionCard } from './RecapSectionCard';

interface WeekRecapQuoteCardProps {
  quote: string;
}

export function WeekRecapQuoteCard({ quote }: WeekRecapQuoteCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(quote);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <RecapSectionCard title="Favorite quote this week" quote>
      <Text style={styles.quoteText}>“{quote}”</Text>
      <Pressable
        accessibilityRole="button"
        onPress={handleCopy}
        style={({ pressed }) => [styles.copyButton, pressed && styles.pressed]}
      >
        <Text style={styles.copyLabel}>{copied ? 'Copied' : 'Copy quote'}</Text>
      </Pressable>
    </RecapSectionCard>
  );
}

const styles = StyleSheet.create({
  quoteText: {
    fontSize: typography.subtitle,
    color: colors.text,
    lineHeight: 28,
    fontStyle: 'italic',
  },
  copyButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  copyLabel: {
    fontSize: typography.small,
    color: colors.accent,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
