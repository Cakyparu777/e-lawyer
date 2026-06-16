import type { PropsWithChildren } from "react";
import { Text as RNText, StyleSheet, TextProps } from "react-native";
import { colors } from "@/theme/colors";

type Variant = "headline" | "title" | "body" | "label" | "caption";

type Props = PropsWithChildren<TextProps & { variant?: Variant; color?: string }>;

export function Text({ variant = "body", color, style, children, ...props }: Props) {
  return (
    <RNText {...props} style={[styles.base, styles[variant], color ? { color } : null, style]}>
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    color: colors.onSurface,
    fontFamily: "System",
    letterSpacing: 0
  },
  headline: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "700"
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "600"
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400"
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600"
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500"
  }
});

