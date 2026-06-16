import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { colors } from "@/theme/colors";
import type { ClientStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<ClientStackParamList, "BookingConfirmed">;

export function BookingConfirmedScreen({ route, navigation }: Props) {
  return (
    <Screen scroll={false}>
      <View style={styles.wrap}>
        <Card style={styles.card}>
          <View style={styles.icon}>
            <Ionicons name="checkmark" size={40} color={colors.onPrimary} />
          </View>
          <Text variant="headline" color={colors.primary} style={styles.center}>
            Захиалга баталгаажлаа
          </Text>
          <Text style={styles.center} color={colors.onSurfaceVariant}>
            Төлбөр амжилттай хийгдэж, хуульчид мэдэгдэл илгээгдлээ. Захиалгын ID: {route.params.appointmentId}
          </Text>
          <Button title="Чат нээх" icon="chatbubble" onPress={() => navigation.navigate("Chat", { appointmentId: route.params.appointmentId })} />
          <Button title="Захиалгаа харах" variant="secondary" onPress={() => navigation.navigate("ClientTabs", { screen: "ClientAppointments" })} />
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: "center" },
  card: { alignItems: "center", gap: 14 },
  icon: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.success, alignItems: "center", justifyContent: "center" },
  center: { textAlign: "center" }
});
