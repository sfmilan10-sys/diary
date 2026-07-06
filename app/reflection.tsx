import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '../src/components/Button';
import { CrisisSupportNote } from '../src/components/CrisisSupportNote';
import { ReflectionContent } from '../src/components/ReflectionContent';
import { ReflectionLoading } from '../src/components/ReflectionLoading';
import { ScreenContainer } from '../src/components/ScreenContainer';
import { generateFutureSelfReflection } from '../src/services/aiReflectionService';
import { useDiary } from '../src/context/DiaryContext';
import { colors, spacing, typography } from '../src/constants/theme';
import type { DiaryEntry } from '../src/types/entry';
import type { FutureSelfReflectionResult } from '../src/types/reflection';
import { buildReflectionContext } from '../src/utils/buildReflectionContext';
import { detectPossibleCrisis } from '../src/utils/crisisSupport';
import { getReflectionSourceMessage } from '../src/utils/reflectionSourceMessage';

type GenerationStatus = 'loading' | 'ready' | 'error';

export default function ReflectionScreen() {
  const router = useRouter();
  const { entries, draft, saveDraftAsEntry, resetDraft } = useDiary();
  const [savedEntry, setSavedEntry] = useState<DiaryEntry | null>(null);
  const [status, setStatus] = useState<GenerationStatus>('loading');
  const [generated, setGenerated] = useState<FutureSelfReflectionResult | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);

  const entryText = draft.text.trim();
  const intention = draft.intention?.trim();
  const showCrisisNote = detectPossibleCrisis(entryText);

  const buildInput = useCallback(
    () => ({
      mood: draft.mood,
      text: entryText,
      intention,
      reflectionContext: buildReflectionContext(entries),
    }),
    [draft.mood, entryText, intention, entries],
  );

  useEffect(() => {
    if (!entryText && !savedEntry) {
      router.replace('/(tabs)');
    }
  }, [entryText, savedEntry, router]);

  useEffect(() => {
    if (!entryText || savedEntry) {
      return;
    }

    let isCancelled = false;

    async function loadReflection() {
      setStatus('loading');
      setGenerated(null);
      setRegenerateError(null);

      try {
        const result = await generateFutureSelfReflection(buildInput());

        if (!isCancelled) {
          setGenerated(result);
          setStatus('ready');
        }
      } catch (error) {
        console.warn('[ReflectionScreen] Reflection generation failed.', error);
        if (!isCancelled) {
          setStatus('error');
        }
      }
    }

    loadReflection();

    return () => {
      isCancelled = true;
    };
  }, [entryText, savedEntry, loadAttempt, buildInput]);

  const handleRegenerate = async () => {
    if (!generated) {
      return;
    }

    const previous = generated;
    setIsRegenerating(true);
    setRegenerateError(null);

    try {
      const result = await generateFutureSelfReflection(buildInput());
      setGenerated(result);
      setStatus('ready');
    } catch (error) {
      console.warn('[ReflectionScreen] Regeneration failed.', error);
      setGenerated(previous);
      setRegenerateError("Couldn't refresh just now. Your last reflection is still here.");
      setStatus('ready');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generated || isSaving) {
      return;
    }
    setIsSaving(true);
    try {
      const saved = await saveDraftAsEntry(generated);
      if (saved) {
        setSavedEntry(saved);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewQuoteCard = () => {
    if (savedEntry) {
      router.push(`/quote/${savedEntry.id}`);
    }
  };

  const handleGoToTimeline = () => {
    router.replace('/(tabs)/timeline');
  };

  const handleWriteAnother = async () => {
    await resetDraft();
    setSavedEntry(null);
    router.replace('/(tabs)');
  };

  const handleRetry = () => {
    setLoadAttempt((current) => current + 1);
  };

  if (!entryText && !savedEntry) {
    return null;
  }

  if (savedEntry) {
    return (
      <ScreenContainer scroll>
        <View style={styles.header}>
          <Text style={styles.title}>Entry saved</Text>
          <Text style={styles.subtitle}>Your reflection is safe in your diary.</Text>
        </View>

        <View style={styles.savedBanner}>
          <Text style={styles.savedText}>
            Your quote card is here whenever you'd like to keep this moment.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button label="View quote card" onPress={handleViewQuoteCard} />
          <Button label="Go to timeline" onPress={handleGoToTimeline} variant="secondary" />
          <Button label="Write another" onPress={handleWriteAnother} variant="ghost" />
        </View>
      </ScreenContainer>
    );
  }

  const showInitialLoading = status === 'loading';
  const showError = status === 'error';
  const showReady = status === 'ready' && generated;

  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Reflection</Text>
        <Text style={styles.subtitle}>A note from your future self</Text>
      </View>

      {showInitialLoading ? <ReflectionLoading /> : null}

      {showError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Something got tangled. Want to try again?</Text>
          <Button label="Try again" onPress={handleRetry} />
        </View>
      ) : null}

      {showReady ? (
        <>
          <Text style={styles.sourceNote}>{getReflectionSourceMessage(generated)}</Text>

          {showCrisisNote ? <CrisisSupportNote /> : null}

          {isRegenerating ? (
            <View style={styles.regeneratingRow}>
              <ActivityIndicator color={colors.accent} />
              <Text style={styles.regeneratingHint}>Refreshing your reflection…</Text>
            </View>
          ) : regenerateError ? (
            <Text style={styles.regenerateError}>{regenerateError}</Text>
          ) : null}

          <ReflectionContent
            dimmed={isRegenerating}
            data={{
              mood: draft.mood,
              entryText,
              reflection: generated.reflection,
              tinyAction: generated.tinyAction,
              affirmation: generated.affirmation,
              quote: generated.quote,
              intention,
            }}
          />

          <View style={styles.actions}>
            <Button
              label={isSaving ? 'Saving…' : 'Save entry'}
              onPress={handleSave}
              disabled={isSaving || isRegenerating}
            />
            <Button
              label={isRegenerating ? 'Regenerating…' : 'Regenerate'}
              onPress={handleRegenerate}
              variant="secondary"
              disabled={isSaving || isRegenerating}
            />
            <Button
              label="Write another"
              onPress={handleWriteAnother}
              variant="ghost"
              disabled={isSaving || isRegenerating}
            />
          </View>
        </>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
    gap: spacing.xs,
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
  sourceNote: {
    fontSize: typography.caption,
    color: colors.textSoft,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  regenerateError: {
    fontSize: typography.small,
    color: colors.coral,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  regeneratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  regeneratingHint: {
    fontSize: typography.small,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  savedBanner: {
    backgroundColor: colors.accentSoft,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  savedText: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 24,
    textAlign: 'center',
  },
  errorBox: {
    gap: spacing.lg,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  errorText: {
    fontSize: typography.body,
    color: colors.textMuted,
    lineHeight: 26,
    textAlign: 'center',
    maxWidth: 300,
  },
  actions: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
    marginTop: spacing.sm,
  },
});
