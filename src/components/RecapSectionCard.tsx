import { ReactNode } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, radius, shadows, spacing, typography } from '../constants/theme';
import { Card } from './Card';

interface RecapSectionCardProps {
  title: string;
  children: ReactNode;
  accent?: boolean;
  quote?: boolean;
  style?: ViewStyle;
}

export function RecapSectionCard({
  title,
  children,
  accent = false,
  quote = false,
  style,
}: RecapSectionCardProps) {
  return (
    <Card
      style={[
        styles.card,
        accent && styles.accentCard,
        quote && styles.quoteCard,
        style,
      ]}
    >
      <Text style={[styles.title, quote && styles.quoteTitle]}>{title}</Text>
      <View style={styles.body}>{children}</View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    ...shadows.soft,
  },
  accentCard: {
    backgroundColor: colors.accentSoft,
    borderColor: 'transparent',
  },
  quoteCard: {
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: typography.caption,
    color: colors.textSoft,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  quoteTitle: {
    color: colors.accent,
  },
  body: {
    gap: spacing.sm,
  },
});
