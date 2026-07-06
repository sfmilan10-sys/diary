import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '../constants/theme';

interface ScreenContainerProps {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export function ScreenContainer({
  children,
  scroll = false,
  padded = true,
  style,
  contentStyle,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  const paddingStyle = padded
    ? {
        paddingTop: insets.top + spacing.md,
        paddingBottom: insets.bottom + spacing.lg,
        paddingHorizontal: spacing.lg,
      }
    : {
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      };

  if (scroll) {
    return (
      <View style={[styles.root, style]}>
        <View style={styles.backgroundTop} />
        <View style={styles.backgroundBottom} />
        <ScrollView
          contentContainerStyle={[paddingStyle, styles.scrollContent, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.root, paddingStyle, style]}>
      <View style={styles.backgroundTop} />
      <View style={styles.backgroundBottom} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: colors.backgroundAccent,
    opacity: 0.55,
  },
  backgroundBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: colors.accentSoft,
    opacity: 0.18,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
