import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '../../src/components/Button';
import { CharacterCounter } from '../../src/components/CharacterCounter';
import { ConfirmDialog } from '../../src/components/ConfirmDialog';
import { MoodBadge } from '../../src/components/MoodBadge';
import { ReflectionContent } from '../../src/components/ReflectionContent';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { useDiary } from '../../src/context/DiaryContext';
import { colors, radius, spacing, typography } from '../../src/constants/theme';
import { getEntrySourceMessage } from '../../src/utils/entrySourceMessage';
import { formatFullEntryDate } from '../../src/utils/format';
import {
  INTENTION_COUNTER_THRESHOLD,
  JOURNAL_COUNTER_THRESHOLD,
  MAX_INTENTION_LENGTH,
  MAX_JOURNAL_LENGTH,
} from '../../src/utils/journalValidation';

export default function EntryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getEntryById, updateEntry, deleteEntry } = useDiary();
  const entry = typeof id === 'string' ? getEntryById(id) : undefined;

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [editIntention, setEditIntention] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    if (!entry) {
      router.replace('/(tabs)/timeline');
    }
  }, [entry, router]);

  useEffect(() => {
    if (entry && !isEditing) {
      setEditText(entry.text);
      setEditIntention(entry.intention ?? '');
    }
  }, [entry, isEditing]);

  if (!entry) {
    return null;
  }

  const sourceMessage = getEntrySourceMessage(entry);

  const handleStartEdit = () => {
    setEditText(entry.text);
    setEditIntention(entry.intention ?? '');
    setEditError(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditText(entry.text);
    setEditIntention(entry.intention ?? '');
    setEditError(null);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    const trimmed = editText.trim();
    if (!trimmed) {
      setEditError('Your entry needs at least one honest sentence.');
      return;
    }

    const updated = await updateEntry(entry.id, {
      text: trimmed,
      intention: editIntention,
    });

    if (updated) {
      setIsEditing(false);
      setEditError(null);
    }
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirm(false);
    const deleted = await deleteEntry(entry.id);
    if (deleted) {
      router.replace('/(tabs)/timeline');
    }
  };

  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Entry</Text>
        <Text style={styles.date}>{formatFullEntryDate(entry.createdAt)}</Text>
        <MoodBadge mood={entry.mood} />
      </View>

      {sourceMessage ? (
        <Text style={styles.sourceNote}>{sourceMessage}</Text>
      ) : null}

      {isEditing ? (
        <View style={styles.editBox}>
          <Text style={styles.editLabel}>Edit your entry</Text>
          <TextInput
            multiline
            maxLength={MAX_JOURNAL_LENGTH}
            style={styles.editInput}
            value={editText}
            onChangeText={setEditText}
            textAlignVertical="top"
            placeholder="Your journal text"
            placeholderTextColor={colors.textSoft}
          />
          <CharacterCounter
            length={editText.length}
            max={MAX_JOURNAL_LENGTH}
            showThreshold={JOURNAL_COUNTER_THRESHOLD}
          />
          <Text style={styles.editLabel}>Intention for tomorrow (optional)</Text>
          <TextInput
            maxLength={MAX_INTENTION_LENGTH}
            style={styles.intentionInput}
            value={editIntention}
            onChangeText={setEditIntention}
            placeholder="One small intention for tomorrow…"
            placeholderTextColor={colors.textSoft}
          />
          <CharacterCounter
            length={editIntention.length}
            max={MAX_INTENTION_LENGTH}
            showThreshold={INTENTION_COUNTER_THRESHOLD}
          />
          {editError ? <Text style={styles.editError}>{editError}</Text> : null}
          <View style={styles.editActions}>
            <Button label="Save changes" onPress={handleSaveEdit} />
            <Button label="Cancel" onPress={handleCancelEdit} variant="secondary" />
          </View>
          <Text style={styles.editHint}>
            Your reflection stays as it was. To get a new one, write a fresh entry from Home.
          </Text>
        </View>
      ) : (
        <ReflectionContent
          data={{
            mood: entry.mood,
            entryText: entry.text,
            reflection: entry.reflection,
            tinyAction: entry.tinyAction,
            affirmation: entry.affirmation,
            quote: entry.quote,
            intention: entry.intention,
          }}
          showMood={false}
        />
      )}

      {!isEditing ? (
        <View style={styles.actions}>
          <Button
            label="View quote card"
            onPress={() => router.push(`/quote/${entry.id}`)}
          />
          <Button label="Edit entry" onPress={handleStartEdit} variant="secondary" />
          <Button
            label="Delete entry"
            onPress={() => setShowDeleteConfirm(true)}
            variant="ghost"
          />
          <Button label="Back to timeline" onPress={() => router.back()} variant="ghost" />
        </View>
      ) : null}

      <ConfirmDialog
        visible={showDeleteConfirm}
        title="Delete this entry?"
        message="This page will be removed from your diary on this device. It cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Keep entry"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
  },
  date: {
    fontSize: typography.small,
    color: colors.textMuted,
  },
  sourceNote: {
    fontSize: typography.caption,
    color: colors.textSoft,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  editBox: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  editLabel: {
    fontSize: typography.caption,
    color: colors.textSoft,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  editInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    minHeight: 160,
    fontSize: typography.body,
    lineHeight: 24,
    color: colors.text,
  },
  intentionInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.body,
    color: colors.text,
  },
  editError: {
    fontSize: typography.small,
    color: colors.error,
  },
  editActions: {
    gap: spacing.sm,
  },
  editHint: {
    fontSize: typography.small,
    color: colors.textMuted,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  actions: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
});
