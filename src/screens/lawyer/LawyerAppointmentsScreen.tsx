import { Alert, StyleSheet, View } from "react-native";
import { apiFetch } from "@/api/client";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { StatusChip } from "@/components/StatusChip";
import { Text } from "@/components/Text";
import { useAppointments } from "@/api/queries";
import { colors } from "@/theme/colors";
import type { Appointment } from "@/types/domain";

export function LawyerAppointmentsScreen() {
  const appointments = useAppointments();

  async function updateStatus(id: string, status: "COMPLETED" | "CANCELLED") {
    try {
      await apiFetch(`/appointments/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      appointments.refetch();
    } catch (error) {
      Alert.alert("Шинэчилж чадсангүй", error instanceof Error ? error.message : "Дахин оролдоно уу");
    }
  }

  return (
    <Screen>
      <Text variant="headline" color={colors.primary}>
        Хуваарь
      </Text>
      {appointments.data?.length === 0 ? <EmptyState title="Одоогоор захиалга алга" /> : null}
      <View style={styles.list}>
        {appointments.data?.map((item: Appointment) => (
          <Card key={item.id} style={styles.card}>
            <View style={styles.row}>
              <Text variant="label">{new Date(item.date_time).toLocaleString("mn-MN")}</Text>
              <StatusChip status={item.status} />
            </View>
            <Text color={colors.onSurfaceVariant}>
              {item.client_contact_snapshot?.username} | {item.client_contact_snapshot?.phoneNumber} |{" "}
              {item.client_contact_snapshot?.email}
            </Text>
            {item.status === "CONFIRMED" ? (
              <View style={styles.actions}>
                <Button title="Дуусгах" onPress={() => updateStatus(item.id, "COMPLETED")} />
                <Button title="Цуцлах" variant="secondary" onPress={() => updateStatus(item.id, "CANCELLED")} />
              </View>
            ) : null}
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12, marginTop: 16 },
  card: { gap: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  actions: { flexDirection: "row", gap: 8 }
});
