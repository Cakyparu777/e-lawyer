import { StyleSheet, View } from "react-native";
import { colors } from "@/theme/colors";
import { Text } from "@/components/Text";
import type { AppointmentStatus } from "@/types/domain";

const tone: Record<AppointmentStatus, { bg: string; fg: string }> = {
  PENDING: { bg: "#fff3d6", fg: colors.warning },
  CONFIRMED: { bg: colors.secondaryContainer, fg: colors.onSecondaryContainer },
  COMPLETED: { bg: "#dff3e3", fg: colors.success },
  CANCELLED: { bg: "#f7dddd", fg: colors.error }
};

export function StatusChip({ status }: { status: AppointmentStatus }) {
  const labels: Record<AppointmentStatus, string> = {
    PENDING: "Хүлээгдэж байна",
    CONFIRMED: "Баталгаажсан",
    COMPLETED: "Дууссан",
    CANCELLED: "Цуцлагдсан"
  };

  return (
    <View style={[styles.chip, { backgroundColor: tone[status].bg }]}>
      <Text variant="caption" color={tone[status].fg}>
        {labels[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4
  }
});
