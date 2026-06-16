import { StyleSheet, TextInput, TextInputProps, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import { Text } from "@/components/Text";

type Props = TextInputProps & {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
};

export function TextField({ label, icon, error, style, ...props }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text variant="caption" color={colors.onSurfaceVariant} style={styles.label}>
        {label}
      </Text>
      <View style={[styles.inputWrap, error ? styles.inputError : null]}>
        {icon ? <Ionicons name={icon} size={19} color={colors.outline} /> : null}
        <TextInput
          placeholderTextColor={colors.outline}
          style={[styles.input, style]}
          autoCapitalize="none"
          {...props}
        />
      </View>
      {error ? (
        <Text variant="caption" color={colors.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 4
  },
  label: {
    marginLeft: 4
  },
  inputWrap: {
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  inputError: {
    borderColor: colors.error
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.onSurface,
    minHeight: 46
  }
});

