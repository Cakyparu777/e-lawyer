import type { PropsWithChildren, ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";

type Props = PropsWithChildren<{
  scroll?: boolean;
  footer?: ReactNode;
}>;

export function Screen({ children, scroll = true, footer }: Props) {
  const content = scroll ? (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, styles.fixedContent]}>{children}</View>
  );
  return (
    <SafeAreaView style={styles.safe}>
      {content}
      {footer}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface
  },
  content: {
    padding: 20,
    paddingBottom: 120,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center"
  },
  fixedContent: {
    flex: 1
  }
});
