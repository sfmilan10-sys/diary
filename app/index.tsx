import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../src/components/Button';
import { ScreenContainer } from '../src/components/ScreenContainer';
import { useDiary } from '../src/context/DiaryContext';
import { colors, spacing, typography } from '../src/constants/theme';

export default function OnboardingScreen() {
  const router = useRouter();
  const { hasCompletedOnboarding, completeOnboarding } = useDiary();

  useEffect(() => {
    if (hasCompletedOnboarding) {
      router.replace('/(tabs)');
    }
  }, [hasCompletedOnboarding, router]);

  const handleStart = async () => {
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  if (hasCompletedOnboarding) {
    return null;
  }

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Welcome</Text>
          <Text style={styles.title}>Future Self Diary</Text>
          <Text style={styles.tagline}>Talk to who you’re becoming.</Text>
        </View>

        <Text style={styles.description}>
          Write your thoughts. Get reflections from your future self. Notice your
          patterns. Grow gently.
        </Text>

        <View style={styles.accentLine} />
      </View>

      <Button label="Start journaling" onPress={handleStart} style={styles.button} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  hero: {
    gap: spacing.sm,
  },
  eyebrow: {
    fontSize: typography.caption,
    color: colors.accent,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: typography.hero,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  tagline: {
    fontSize: typography.subtitle,
    color: colors.coral,
    fontWeight: '500',
    marginTop: spacing.xs,
  },
  description: {
    fontSize: typography.body,
    lineHeight: 26,
    color: colors.textMuted,
    maxWidth: 320,
  },
  accentLine: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    opacity: 0.5,
    marginTop: spacing.md,
  },
  button: {
    marginTop: spacing.xl,
  },
});
