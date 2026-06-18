import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { StatusChip } from "@/components/StatusChip";
import { Text } from "@/components/Text";
import { useChatThreads } from "@/api/queries";
import { useAuthStore } from "@/state/authStore";
import { colors } from "@/theme/colors";
import type { ChatThreadSummary } from "@/types/domain";

type Props = {
  navigation: {
    navigate: (screen: "Chat", params: { appointmentId: string }) => void;
  };
};

export function ChatListScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);
  const chats = useChatThreads();

  function peerName(item: ChatThreadSummary) {
    return user?.role === "LAWYER" ? item.client_contact_snapshot.username : item.lawyer_contact_snapshot.username;
  }

  return (
    <Screen>
      <Text variant="headline" color={colors.primary}>
        Чатууд
      </Text>
      <Text color={colors.onSurfaceVariant}>Төлбөр баталгаажсан зөвлөгөөний өмнөх ярианууд энд хадгалагдана.</Text>

      {chats.isLoading ? <EmptyState title="Чатуудыг ачаалж байна..." /> : null}
      {chats.data?.length === 0 ? <EmptyState title="Одоогоор чат алга" body="Төлбөр баталгаажсан захиалга үүсмэгц чат энд харагдана." /> : null}

      <View style={styles.list}>
        {chats.data?.map((item: ChatThreadSummary) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`${peerName(item)}-тэй чат нээх`}
            onPress={() => navigation.navigate("Chat", { appointmentId: item.appointment_id })}
          >
            <Card style={styles.card}>
              <View style={styles.top}>
                <View style={styles.avatar}>
                  <Ionicons name="chatbubble" size={18} color={colors.onPrimary} />
                </View>
                <View style={styles.content}>
                  <View style={styles.titleRow}>
                    <Text variant="label" color={colors.primary} numberOfLines={1}>
                      {peerName(item)}
                    </Text>
                    <StatusChip status={item.appointment.status} />
                  </View>
                  <Text variant="caption" color={colors.onSurfaceVariant}>
                    {new Date(item.appointment.date_time).toLocaleString("mn-MN")}
                  </Text>
                  <Text numberOfLines={2} color={colors.onSurfaceVariant}>
                    {item.latest_message?.body || "Чат нээгдсэн байна. Мессеж бичиж эхлээрэй."}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.outline} />
              </View>
            </Card>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12, marginTop: 16 },
  card: { gap: 10 },
  top: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  content: { flex: 1, gap: 3 },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }
});
