import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { DailyPromptCard } from '../../src/components/DailyPromptCard';
import { HomeGreeting } from '../../src/components/HomeGreeting';
import { IntentionInput } from '../../src/components/IntentionInput';
import { JournalInput } from '../../src/components/JournalInput';
import { LastReflectionPreview } from '../../src/components/LastReflectionPreview';
import { MoodSelector } from '../../src/components/MoodSelector';
import { RecentActivityCard } from '../../src/components/RecentActivityCard';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { useDiary } from '../../src/context/DiaryContext';
import { colors, spacing, typography } from '../../src/constants/theme';
import {
  canReflectWithText,
  getReflectDisabledHint,
} from '../../src/utils/journalValidation';
import { getPrivacyReassuranceMessage } from '../../src/utils/reflectionPrivacy';
import { getWritingIndicatorMessage } from '../../src/utils/writingIndicator';

const JOURNAL_PLACEHOLDER =
  'Write what happened, what you felt, or what you wish someone understood…';

export default function HomeScreen() {
  const router = useRouter();
  const {
    entries,
    draft,
    isDraftSaved,
    setDraftMood,
    setDraftText,
    setDraftIntention,
  } = useDiary();

  const canReflect = canReflectWithText(draft.text);
  const reflectHint = getReflectDisabledHint(draft.text);
  const writingIndicator = getWritingIndicatorMessage(draft.text.length);
  const privacyNote = getPrivacyReassuranceMessage();

  const handleReflect = () => {
    if (!canReflect) {
      return;
    }
    router.push('/reflection');
  };

  return (
    <ScreenContainer scroll>
      <HomeGreeting />

      <RecentActivityCard
        entries={entries}
        onOpenRecap={() => router.push('/(tabs)/recap')}
        onOpenTimeline={() => router.push('/(tabs)/timeline')}
      />

      <LastReflectionPreview
        entries={entries}
        onRevisit={(entryId) => router.push(`/entry/${entryId}`)}
      />

      <DailyPromptCard currentText={draft.text} onApplyPrompt={setDraftText} />

      <Card style={styles.writingCard}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Your mood</Text>
          <MoodSelector selectedMood={draft.mood} onSelect={setDraftMood} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Today's entry</Text>
          <JournalInput
            value={draft.text}
            onChangeText={setDraftText}
            placeholder={JOURNAL_PLACEHOLDER}
          />
          <Text style={styles.writingIndicator}>{writingIndicator}</Text>
          {isDraftSaved ? (
            <Text style={styles.draftSaved}>Draft saved privately on this device.</Text>
          ) : null}
        </View>

        <IntentionInput
          value={draft.intention ?? ''}
          onChangeText={setDraftIntention}
        />
      </Card>

      <Text style={styles.privacyNote}>{privacyNote}</Text>

      {!canReflect && reflectHint ? (
        <Text style={styles.reflectHint}>{reflectHint}</Text>
      ) : null}

      <Button
        label="Reflect with Future Me"
        onPress={handleReflect}
        disabled={!canReflect}
        style={styles.reflectButton}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  writingCard: {
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  section: {
    gap: spacing.md,
  },
  sectionLabel: {
    fontSize: typography.caption,
    color: colors.textSoft,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  writingIndicator: {
    fontSize: typography.small,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  draftSaved: {
    fontSize: typography.caption,
    color: colors.accent,
  },
  privacyNote: {
    fontSize: typography.caption,
    color: colors.textSoft,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontStyle: 'italic',
  },
  reflectHint: {
    fontSize: typography.small,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  reflectButton: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
});
