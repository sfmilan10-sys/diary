import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../constants/theme';
import { CRISIS_SUPPORT_NOTE } from '../utils/crisisSupport';

export function CrisisSupportNote() {
  return (
    <View style={styles.container} accessibilityRole="summary">
      <Text style={styles.text}>{CRISIS_SUPPORT_NOTE}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.blueSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  text: {
    fontSize: typography.small,
    color: colors.text,
    lineHeight: 22,
  },
});
