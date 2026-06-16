import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { colors } from "@/theme/colors";
import { Text } from "@/components/Text";

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <View style={styles.wrap}>
      <Ionicons name="file-tray-outline" size={28} color={colors.outline} />
      <Text variant="label">{title}</Text>
      {body ? (
        <Text variant="body" color={colors.onSurfaceVariant} style={styles.body}>
          {body}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 36,
    alignItems: "center",
    gap: 8
  },
  body: {
    textAlign: "center"
  }
});

