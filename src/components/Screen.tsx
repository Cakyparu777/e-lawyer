import type { PropsWithChildren, ReactNode } from "react";
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";

type Props = PropsWithChildren<{
  scroll?: boolean;
  footer?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}>;

export function Screen({ children, scroll = true, footer, contentStyle }: Props) {
  const content = scroll ? (
    <ScrollView contentContainerStyle={[styles.content, contentStyle]} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, styles.fixedContent, contentStyle]}>{children}</View>
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
    paddingBottom: 160,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center"
  },
  fixedContent: {
    flex: 1
  }
});
