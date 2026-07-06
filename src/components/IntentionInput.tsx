import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, spacing, typography } from '../constants/theme';
import {
  INTENTION_COUNTER_THRESHOLD,
  MAX_INTENTION_LENGTH,
} from '../utils/journalValidation';
import { CharacterCounter } from './CharacterCounter';

interface IntentionInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

export function IntentionInput({ value, onChangeText }: IntentionInputProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Intention for tomorrow (optional)</Text>
      <TextInput
        maxLength={MAX_INTENTION_LENGTH}
        placeholder="One small intention for tomorrow…"
        placeholderTextColor={colors.textSoft}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
      />
      <CharacterCounter
        length={value.length}
        max={MAX_INTENTION_LENGTH}
        showThreshold={INTENTION_COUNTER_THRESHOLD}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  label: {
    fontSize: typography.caption,
    color: colors.textSoft,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.body,
    color: colors.text,
  },
});
