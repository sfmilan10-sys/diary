import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../constants/theme';
import { getHomeGreeting } from '../utils/homeGreeting';

export function HomeGreeting() {
  const { greeting, supportiveLine } = getHomeGreeting();

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>{greeting}</Text>
      <Text style={styles.supportiveLine}>{supportiveLine}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  greeting: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  supportiveLine: {
    fontSize: typography.small,
    color: colors.textMuted,
    lineHeight: 22,
  },
});
