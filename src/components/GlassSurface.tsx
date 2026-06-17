import type { PropsWithChildren } from "react";
import { Platform, StyleSheet, View, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { colors } from "@/theme/colors";

type Props = PropsWithChildren<{
  style?: ViewStyle | ViewStyle[];
  intensity?: number;
  tint?: "light" | "dark" | "default";
}>;

export function GlassSurface({ children, style, intensity = 34, tint = "light" }: Props) {
  if (Platform.OS === "ios") {
    return (
      <BlurView intensity={intensity} tint={tint} style={[styles.base, style]}>
        <View pointerEvents="none" style={styles.liquidTint} />
        <View style={styles.content}>{children}</View>
      </BlurView>
    );
  }

  return <View style={[styles.base, styles.fallback, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.88)",
    backgroundColor: "rgba(255,255,255,0.76)",
    shadowColor: "#031632",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 28,
    elevation: 4
  },
  liquidTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.76)"
  },
  content: {
    flex: 1,
    backgroundColor: "transparent"
  },
  fallback: {
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.outlineVariant
  }
});
