import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import * as Clipboard from 'expo-clipboard';

import { colors, radius, spacing, typography } from '../constants/theme';
import { LEGACY_AFFIRMATION, LEGACY_QUOTE } from '../utils/entryDefaults';
import { Card } from './Card';
import { MoodBadge } from './MoodBadge';
import type { Mood } from '../types/entry';

export interface ReflectionDisplay {
  mood: Mood;
  entryText: string;
  reflection: string;
  tinyAction: string;
  affirmation?: string;
  quote?: string;
  intention?: string;
}

interface ReflectionContentProps {
  data: ReflectionDisplay;
  showMood?: boolean;
  showEntry?: boolean;
  style?: ViewStyle;
  dimmed?: boolean;
}

export function ReflectionContent({
  data,
  showMood = true,
  showEntry = true,
  style,
  dimmed = false,
}: ReflectionContentProps) {
  const affirmation = data.affirmation?.trim() || LEGACY_AFFIRMATION;
  const quote = data.quote?.trim() || LEGACY_QUOTE;
  const intention = data.intention?.trim();
  const [copied, setCopied] = useState(false);

  const handleCopyQuote = async () => {
    await Clipboard.setStringAsync(quote);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={[style, dimmed && styles.dimmed]}>
      {showMood ? (
        <Card style={styles.block}>
          <Text style={styles.blockLabel}>Mood</Text>
          <MoodBadge mood={data.mood} />
        </Card>
      ) : null}

      {showEntry ? (
        <Card style={styles.block}>
          <Text style={styles.blockLabel}>Your entry</Text>
          <Text style={styles.bodyText}>{data.entryText}</Text>
        </Card>
      ) : null}

      {intention ? (
        <Card style={[styles.block, styles.intentionCard]}>
          <Text style={styles.blockLabel}>Intention for tomorrow</Text>
          <Text style={styles.bodyText}>{intention}</Text>
        </Card>
      ) : null}

      <Card style={[styles.block, styles.reflectionCard]}>
        <Text style={styles.sectionTitle}>Future Me says</Text>
        <Text style={styles.reflectionText}>{data.reflection}</Text>
      </Card>

      <View style={styles.tinyAction}>
        <Text style={styles.sectionTitle}>Tiny action for tomorrow</Text>
        <Text style={styles.sectionText}>{data.tinyAction}</Text>
      </View>

      <Card style={[styles.block, styles.affirmationCard]}>
        <Text style={styles.sectionTitle}>Affirmation</Text>
        <Text style={styles.affirmationText}>{affirmation}</Text>
      </Card>

      <Card style={[styles.block, styles.quoteCard]}>
        <View style={styles.quoteHeader}>
          <Text style={styles.quoteTitle}>Quote to keep</Text>
          <Pressable
            accessibilityRole="button"
            onPress={handleCopyQuote}
            style={({ pressed }) => [styles.copyButton, pressed && styles.copyPressed]}
          >
            <Text style={styles.copyButtonText}>{copied ? 'Copied' : 'Copy quote'}</Text>
          </Pressable>
        </View>
        <Text style={styles.quoteText}>“{quote}”</Text>
        {copied ? <Text style={styles.copiedHint}>Copied to clipboard</Text> : null}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  dimmed: {
    opacity: 0.45,
  },
  block: {
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  blockLabel: {
    fontSize: typography.caption,
    color: colors.textSoft,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: typography.caption,
    color: colors.textSoft,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  bodyText: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 26,
  },
  intentionCard: {
    backgroundColor: colors.blueSoft,
    borderColor: 'transparent',
  },
  reflectionCard: {
    backgroundColor: colors.accentSoft,
    borderColor: 'transparent',
  },
  reflectionText: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 28,
    fontStyle: 'italic',
  },
  tinyAction: {
    backgroundColor: colors.coralSoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionText: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 26,
  },
  affirmationCard: {
    backgroundColor: colors.surface,
  },
  affirmationText: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 26,
    fontWeight: '500',
  },
  quoteCard: {
    backgroundColor: colors.surface,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    gap: spacing.md,
  },
  quoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  quoteTitle: {
    fontSize: typography.caption,
    color: colors.accent,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  copyButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.accentSoft,
  },
  copyPressed: {
    opacity: 0.85,
  },
  copyButtonText: {
    fontSize: typography.caption,
    color: colors.accent,
    fontWeight: '600',
  },
  quoteText: {
    fontSize: typography.subtitle,
    color: colors.text,
    lineHeight: 30,
    fontStyle: 'italic',
  },
  copiedHint: {
    fontSize: typography.caption,
    color: colors.accent,
  },
});
