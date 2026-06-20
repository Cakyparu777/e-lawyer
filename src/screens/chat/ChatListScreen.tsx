import { useMemo, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { StatusChip } from "@/components/StatusChip";
import { Text } from "@/components/Text";
import { TextField } from "@/components/TextField";
import { useChatThreads } from "@/api/queries";
import { useAuthStore } from "@/state/authStore";
import { colors } from "@/theme/colors";
import type { ChatThreadSummary } from "@/types/domain";

type Props = {
  navigation: {
    navigate: (screen: "Chat", params: { appointmentId: string }) => void;
  };
};

const emptyPreview = "Чат нээгдсэн байна. Мессеж бичиж эхлээрэй.";

function contactFor(item: ChatThreadSummary, role?: string) {
  return role === "LAWYER" ? item.client_contact_snapshot : item.lawyer_contact_snapshot;
}

function peerName(item: ChatThreadSummary, role?: string) {
  return contactFor(item, role).username || "Хэрэглэгч";
}

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`;
  return initials || "?";
}

function formatAppointmentTime(value: string) {
  return new Date(value).toLocaleString("mn-MN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatMessageTime(value?: string | null) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleTimeString("mn-MN", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function ChatListScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);
  const chats = useChatThreads();
  const [search, setSearch] = useState("");

  const chatItems = chats.data ?? [];
  const confirmedCount = chatItems.filter((item) => item.appointment.status === "CONFIRMED").length;
  const filteredChats = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return chatItems;
    }

    return chatItems.filter((item) => {
      const contact = contactFor(item, user?.role);
      const values = [
        peerName(item, user?.role),
        contact.email,
        contact.phone,
        item.latest_message?.body,
        item.appointment.status,
        item.appointment_id
      ];

      return values.some((value) => value?.toLowerCase().includes(query));
    });
  }, [chatItems, search, user?.role]);
  const hasSearch = search.trim().length > 0;

  return (
    <Screen contentStyle={styles.screenContent}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text variant="headline" color={colors.primary}>
            Чатууд
          </Text>
          {/* <Text color={colors.onSurfaceVariant}>Зөвлөгөөний өмнөх яриагаа хурдан шалгаарай.</Text> */}
        </View>
        <View style={styles.countBadge}>
          <Text variant="label" color={colors.onPrimary}>
            {chatItems.length}
          </Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryPill}>
          <Ionicons name="chatbubbles" size={16} color={colors.secondary} />
          <Text variant="caption" color={colors.onSecondaryContainer}>
            Нийт {chatItems.length}
          </Text>
        </View>
        <View style={styles.summaryPill}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text variant="caption" color={colors.success}>
            Идэвхтэй {confirmedCount}
          </Text>
        </View>
      </View>

      <TextField
        label="Хайлт"
        icon="search"
        value={search}
        onChangeText={setSearch}
        placeholder="Нэр, имэйл эсвэл мессеж"
        autoCorrect={false}
        returnKeyType="search"
      />

      {chats.isLoading ? <EmptyState title="Чатуудыг ачаалж байна..." /> : null}
      {chats.isError ? <EmptyState title="Чат ачаалж чадсангүй" body="Дахин оролдоод үзээрэй." /> : null}
      {!chats.isLoading && chatItems.length === 0 ? (
        <EmptyState title="Одоогоор чат алга" body="Төлбөр баталгаажсан захиалга үүсмэгц чат энд харагдана." />
      ) : null}
      {!chats.isLoading && chatItems.length > 0 && filteredChats.length === 0 ? (
        <EmptyState title="Илэрц олдсонгүй" body="Өөр нэр эсвэл мессежээр хайгаад үзээрэй." />
      ) : null}

      <View style={styles.list}>
        {filteredChats.map((item: ChatThreadSummary) => {
          const name = peerName(item, user?.role);
          const latestBody = item.latest_message?.body || emptyPreview;
          const latestTime = formatMessageTime(item.latest_message?.created_at || item.last_message_at);

          return (
            <TouchableOpacity
              key={item.id}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`${name}-тэй чат нээх`}
              accessibilityHint="Чатын дэлгэрэнгүй дэлгэцийг нээнэ"
              testID={`chat-thread-${item.id}`}
              onPress={() => navigation.navigate("Chat", { appointmentId: item.appointment_id })}
              activeOpacity={0.72}
              style={styles.pressable}
            >
              <Card style={styles.card}>
                <View style={styles.top}>
                  <View style={styles.avatar}>
                    <Text variant="label" color={colors.onPrimary} style={styles.avatarText}>
                      {initialsFor(name)}
                    </Text>
                  </View>
                  <View style={styles.content}>
                    <View style={styles.titleRow}>
                      <Text variant="label" color={colors.primary} numberOfLines={1} style={styles.name}>
                        {name}
                      </Text>
                      <Text variant="caption" color={colors.outline}>
                        {latestTime}
                      </Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Ionicons name="calendar-clear-outline" size={14} color={colors.secondary} />
                      <Text variant="caption" color={colors.onSurfaceVariant} numberOfLines={1}>
                        {formatAppointmentTime(item.appointment.date_time)}
                      </Text>
                    </View>
                    <Text numberOfLines={2} color={colors.onSurfaceVariant} style={styles.preview}>
                      {latestBody}
                    </Text>
                    <View style={styles.bottomRow}>
                      <StatusChip status={item.appointment.status} />
                      {hasSearch ? (
                        <View style={styles.matchPill}>
                          <Ionicons name="search" size={13} color={colors.secondary} />
                          <Text variant="caption" color={colors.onSecondaryContainer}>
                            Илэрц
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                  <View style={styles.openButton}>
                    <Ionicons name="chevron-forward" size={18} color={colors.primary} />
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    gap: 16
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16
  },
  headerCopy: {
    flex: 1,
    gap: 6
  },
  countBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2
  },
  summaryRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap"
  },
  summaryPill: {
    minHeight: 34,
    borderRadius: 17,
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  list: {
    gap: 12
  },
  pressable: {
    borderRadius: 14
  },
  card: {
    gap: 10,
    padding: 14,
    borderRadius: 14
  },
  top: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: {
    textTransform: "uppercase"
  },
  content: { flex: 1, gap: 5 },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  name: {
    flex: 1
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5
  },
  preview: {
    paddingRight: 4
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 2
  },
  matchPill: {
    borderRadius: 999,
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 9,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  openButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  }
});
