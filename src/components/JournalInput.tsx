import { StyleSheet, TextInput, View } from 'react-native';

import { colors, radius, shadows, spacing, typography } from '../constants/theme';
import {
  JOURNAL_COUNTER_THRESHOLD,
  MAX_JOURNAL_LENGTH,
} from '../utils/journalValidation';
import { CharacterCounter } from './CharacterCounter';

interface JournalInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function JournalInput({
  value,
  onChangeText,
  placeholder = "What's on your mind today?",
}: JournalInputProps) {
  return (
    <View>
      <View style={styles.wrapper}>
        <TextInput
          multiline
          maxLength={MAX_JOURNAL_LENGTH}
          placeholder={placeholder}
          placeholderTextColor={colors.textSoft}
          style={styles.input}
          textAlignVertical="top"
          value={value}
          onChangeText={onChangeText}
        />
      </View>
      <CharacterCounter
        length={value.length}
        max={MAX_JOURNAL_LENGTH}
        showThreshold={JOURNAL_COUNTER_THRESHOLD}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 180,
    ...shadows.soft,
  },
  input: {
    flex: 1,
    minHeight: 180,
    padding: spacing.lg,
    fontSize: typography.body,
    lineHeight: 24,
    color: colors.text,
  },
});
