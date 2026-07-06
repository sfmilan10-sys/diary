import { useEffect, useRef, useState } from 'react';
import { Animated, ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../constants/theme';

const LOADING_PHRASES = [
  'Future Me is reading between the lines…',
  'Finding the gentle truth in today…',
  'Turning today into tomorrow\'s wisdom…',
];

const PHRASE_INTERVAL_MS = 3200;

export function ReflectionLoading() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const phraseTimer = setInterval(() => {
      setPhraseIndex((current) => (current + 1) % LOADING_PHRASES.length);
    }, PHRASE_INTERVAL_MS);

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      clearInterval(phraseTimer);
      animation.stop();
    };
  }, [pulse]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.indicatorWrap, { opacity: pulse }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </Animated.View>
      <Text style={styles.title}>{LOADING_PHRASES[phraseIndex]}</Text>
      <Text style={styles.subtitle}>Take a slow breath while your reflection arrives.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.xl,
  },
  indicatorWrap: {
    padding: spacing.md,
  },
  title: {
    fontSize: typography.subtitle,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 300,
  },
  subtitle: {
    fontSize: typography.small,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
});
