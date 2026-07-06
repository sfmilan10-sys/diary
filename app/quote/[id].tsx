import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../src/components/Button';
import { QuoteCardVisual } from '../../src/components/QuoteCardVisual';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { useDiary } from '../../src/context/DiaryContext';
import { colors, spacing, typography } from '../../src/constants/theme';
import { formatEntryDate } from '../../src/utils/format';

export default function QuoteCardScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getEntryById } = useDiary();
  const entry = typeof id === 'string' ? getEntryById(id) : undefined;

  if (!entry) {
    return (
      <ScreenContainer style={styles.errorContainer}>
        <Text style={styles.errorTitle}>This entry could not be found</Text>
        <Text style={styles.errorBody}>
          It may have been removed or the link is no longer valid.
        </Text>
        <Button
          label="Back to timeline"
          onPress={() => router.replace('/(tabs)/timeline')}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll contentStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>Quote card</Text>
        <Text style={styles.subtitle}>A keepsake from your future self</Text>
      </View>

      <QuoteCardVisual
        quote={entry.quote}
        mood={entry.mood}
        dateLabel={formatEntryDate(entry.createdAt)}
      />

      <Text style={styles.hint}>Screenshot this card to keep or share it.</Text>

      <View style={styles.actions}>
        <Button label="Back" onPress={() => router.back()} variant="secondary" />
        <Button
          label="View full entry"
          onPress={() => router.push(`/entry/${entry.id}`)}
          variant="ghost"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    alignItems: 'stretch',
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.lg,
    gap: spacing.xs,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.small,
    color: colors.textMuted,
    textAlign: 'center',
  },
  hint: {
    marginTop: spacing.lg,
    fontSize: typography.small,
    color: colors.textSoft,
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    marginTop: spacing.xl,
    gap: spacing.md,
    width: '100%',
  },
  errorContainer: {
    justifyContent: 'center',
    gap: spacing.lg,
  },
  errorTitle: {
    fontSize: typography.subtitle,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  errorBody: {
    fontSize: typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
});
