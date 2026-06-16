import { StyleSheet, View } from "react-native";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { StatusChip } from "@/components/StatusChip";
import { Text } from "@/components/Text";
import { useAppointments } from "@/api/queries";
import { useAuthStore } from "@/state/authStore";
import { colors } from "@/theme/colors";
import type { Appointment } from "@/types/domain";

export function LawyerDashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const appointments = useAppointments();
  const today = appointments.data?.filter((item: Appointment) => new Date(item.date_time).toDateString() === new Date().toDateString()) || [];
  const confirmed = appointments.data?.filter((item: Appointment) => item.status === "CONFIRMED") || [];

  return (
    <Screen>
      <Text variant="headline" color={colors.primary}>
        Сайн байна уу, {user?.username || "Хуульч"}
      </Text>
      <Text color={colors.onSurfaceVariant}>Өнөөдрийн товч мэдээлэл.</Text>
      <View style={styles.stats}>
        <Card style={styles.stat}>
          <Text variant="headline">{appointments.data?.length || 0}</Text>
          <Text variant="caption" color={colors.onSurfaceVariant}>
            Нийт захиалга
          </Text>
        </Card>
        <Card style={[styles.stat, styles.primaryStat]}>
          <Text variant="headline" color={colors.onPrimary}>
            {today.length}
          </Text>
          <Text variant="caption" color={colors.secondaryContainer}>
            Өнөөдрийн цагууд
          </Text>
        </Card>
      </View>
      <Text variant="title" color={colors.primary} style={styles.section}>
        Шинэ хүсэлтүүд
      </Text>
      {confirmed.length === 0 ? <EmptyState title="Баталгаажсан захиалга алга" /> : null}
      {confirmed.slice(0, 3).map((item: Appointment) => (
        <Card key={item.id} style={styles.request}>
          <View style={styles.row}>
            <View>
              <Text variant="label">{new Date(item.date_time).toLocaleString("mn-MN")}</Text>
              <Text variant="caption" color={colors.onSurfaceVariant}>
                Үйлчлүүлэгч: {item.client_contact_snapshot?.username || "Үйлчлүүлэгч"}
              </Text>
            </View>
            <StatusChip status={item.status} />
          </View>
          <Text color={colors.onSurfaceVariant}>
            {item.client_contact_snapshot?.phoneNumber} {item.client_contact_snapshot?.email}
          </Text>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: "row", gap: 12, marginTop: 22 },
  stat: { flex: 1, minHeight: 118, justifyContent: "space-between" },
  primaryStat: { backgroundColor: colors.primary, borderColor: colors.primary },
  section: { marginTop: 24, marginBottom: 12 },
  request: { gap: 10, marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 12 }
});
