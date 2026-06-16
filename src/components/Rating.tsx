import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import { Text } from "@/components/Text";

export function Rating({ value, count }: { value: number; count?: number }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      <Ionicons name="star" size={15} color={colors.star} />
      <Text variant="caption">{value.toFixed(1)}</Text>
      {typeof count === "number" ? (
        <Text variant="caption" color={colors.onSurfaceVariant}>
          ({count})
        </Text>
      ) : null}
    </View>
  );
}

