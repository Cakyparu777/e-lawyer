import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StyleSheet, View } from "react-native";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { StatusChip } from "@/components/StatusChip";
import { Text } from "@/components/Text";
import { useAppointments } from "@/api/queries";
import { colors } from "@/theme/colors";
import type { Appointment } from "@/types/domain";
import type { ClientStackParamList, ClientTabParamList } from "@/navigation/types";

type Props = CompositeScreenProps<
  BottomTabScreenProps<ClientTabParamList, "ClientAppointments">,
  NativeStackScreenProps<ClientStackParamList>
>;

export function ClientAppointmentsScreen({ navigation }: Props) {
  const appointments = useAppointments();

  return (
    <Screen>
      <Text variant="headline" color={colors.primary}>
        Миний захиалгууд
      </Text>
      {appointments.data?.length === 0 ? <EmptyState title="Одоогоор захиалга алга" /> : null}
      <View style={styles.list}>
        {appointments.data?.map((appointment: Appointment) => (
          <Card key={appointment.id} style={styles.card}>
            <View style={styles.row}>
              <View>
                <Text variant="label">{new Date(appointment.date_time).toLocaleString("mn-MN")}</Text>
                <Text variant="caption" color={colors.onSurfaceVariant}>
                  Хуульчийн ID: {appointment.lawyer_id.slice(0, 8)}
                </Text>
              </View>
              <StatusChip status={appointment.status} />
            </View>
            {appointment.status === "COMPLETED" ? (
              <Button
                title="Үнэлгээ үлдээх"
                variant="secondary"
                icon="star"
                onPress={() => navigation.navigate("Review", { appointmentId: appointment.id, lawyerId: appointment.lawyer_id })}
              />
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
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 }
});
