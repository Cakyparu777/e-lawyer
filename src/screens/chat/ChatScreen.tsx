import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EmptyState } from "@/components/EmptyState";
import { GlassSurface } from "@/components/GlassSurface";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { useChatThread, useSendChatMessage } from "@/api/queries";
import { useAuthStore } from "@/state/authStore";
import { connectAgoraRtm, type AgoraRtmSession } from "@/services/agoraRtm";
import { colors } from "@/theme/colors";
import type { ChatMessage } from "@/types/domain";

type Props = {
  route: { params: { appointmentId: string } };
  navigation: { goBack: () => void };
};

function contactName(contact?: Record<string, string> | null) {
  return contact?.username || "Хэрэглэгч";
}

function contactMeta(contact?: Record<string, string> | null) {
  return contact?.phoneNumber || contact?.phone || contact?.email || "Холбогдох мэдээлэл алга";
}

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`;
  return initials || "?";
}

function isSameDay(left: string, right: string) {
  const leftDate = new Date(left);
  const rightDate = new Date(right);

  return (
    leftDate.getFullYear() === rightDate.getFullYear() &&
    leftDate.getMonth() === rightDate.getMonth() &&
    leftDate.getDate() === rightDate.getDate()
  );
}

function formatDay(value: string) {
  return new Date(value).toLocaleDateString("mn-MN", {
    month: "short",
    day: "numeric",
    weekday: "short"
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("mn-MN", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function ChatScreen({ route, navigation }: Props) {
  const user = useAuthStore((state) => state.user);
  const thread = useChatThread(route.params.appointmentId);
  const sendMessage = useSendChatMessage();
  const [text, setText] = useState("");
  const [rtmStatus, setRtmStatus] = useState("SERVER_FALLBACK");
  const rtmSession = useRef<AgoraRtmSession | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);

  const peerContact = useMemo(() => {
    if (!thread.data || !user) return null;
    return user.role === "CLIENT" ? thread.data.lawyer_contact_snapshot : thread.data.client_contact_snapshot;
  }, [thread.data, user]);
  const peerDisplayName = contactName(peerContact);
  const peerDetails = contactMeta(peerContact);
  const connected = rtmStatus === "CONNECTED";
  const canSend = Boolean(text.trim()) && !sendMessage.isPending && Boolean(thread.data);

  useEffect(() => {
    let active = true;
    connectAgoraRtm(
      route.params.appointmentId,
      () => thread.refetch(),
      (status) => active && setRtmStatus(status)
    )
      .then((session) => {
        if (!active) {
          session.cleanup();
          return;
        }
        rtmSession.current = session;
        if (!session.connected) setRtmStatus("SERVER_FALLBACK");
      })
      .catch(() => {
        if (active) setRtmStatus("SERVER_FALLBACK");
      });

    return () => {
      active = false;
      rtmSession.current?.cleanup();
      rtmSession.current = null;
    };
  }, [route.params.appointmentId]);

  async function send() {
    const next = text.trim();
    if (!thread.data || !next) return;
    setText("");
    try {
      const saved = await sendMessage.mutateAsync({ thread_id: thread.data.id, appointment_id: thread.data.appointment_id, text: next });
      await rtmSession.current?.publish(
        JSON.stringify({
          type: "chat.message",
          appointmentId: thread.data.appointment_id,
          threadId: thread.data.id,
          messageId: saved.id
        })
      ).catch(() => {});
    } catch (error) {
      setText(next);
      Alert.alert("Мессеж илгээж чадсангүй", error instanceof Error ? error.message : "Дахин оролдоно уу");
    }
  }

  return (
    <Screen scroll={false} contentStyle={styles.screenContent}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
        style={styles.wrap}
      >
        <GlassSurface style={styles.header} contentStyle={styles.headerContent} intensity={30}>
          <Pressable accessibilityRole="button" accessibilityLabel="Буцах" onPress={navigation.goBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </Pressable>
          <View style={styles.avatar}>
            <Text variant="label" color={colors.onPrimary} style={styles.avatarText}>
              {initialsFor(peerDisplayName)}
            </Text>
          </View>
          <View style={styles.headerText} accessible accessibilityLabel={`${peerDisplayName} чат`}>
            <Text variant="label" color={colors.primary} numberOfLines={1}>
              {peerDisplayName}
            </Text>
            <Text variant="caption" color={colors.onSurfaceVariant}>
              {peerDetails}
            </Text>
          </View>
          <View style={[styles.statusPill, connected ? styles.statusConnected : styles.statusFallback]}>
            <View style={[styles.statusDot, connected ? styles.dotConnected : styles.dotFallback]} />
            <Text variant="caption" color={connected ? colors.success : colors.warning}>
              {connected ? "Live" : "Sync"}
            </Text>
          </View>
        </GlassSurface>

        {thread.isLoading ? <EmptyState title="Чатыг ачаалж байна..." /> : null}
        {thread.isError ? <EmptyState title="Чат нээгдсэнгүй" body="Төлбөр баталгаажсан эсэхийг шалгана уу." /> : null}

        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messageContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {thread.data?.messages.length === 0 ? (
            <EmptyState title="Одоогоор мессеж алга" body="Анхны мессежээ доороос бичээд эхлээрэй." />
          ) : null}
          {thread.data?.messages.map((message: ChatMessage, index: number) => {
            const mine = message.sender_id === user?.id;
            const automatic = message.message_type === "AUTO_RESPONSE";
            const previous = thread.data?.messages[index - 1];
            const next = thread.data?.messages[index + 1];
            const startsGroup = !previous || previous.sender_id !== message.sender_id || !isSameDay(previous.created_at, message.created_at);
            const endsGroup = !next || next.sender_id !== message.sender_id || !isSameDay(next.created_at, message.created_at);
            const showDay = !previous || !isSameDay(previous.created_at, message.created_at);

            return (
              <View key={message.id}>
                {showDay ? (
                  <View style={styles.dayDivider}>
                    <Text variant="caption" color={colors.onSurfaceVariant}>
                      {formatDay(message.created_at)}
                    </Text>
                  </View>
                ) : null}
                <View
                  style={[
                    styles.messageRow,
                    mine ? styles.mineRow : styles.theirsRow,
                    startsGroup ? styles.groupStart : styles.groupTight
                  ]}
                >
                  {!mine && endsGroup ? (
                    <View style={styles.smallAvatar}>
                      <Text variant="caption" color={colors.onPrimary} style={styles.avatarText}>
                        {initialsFor(peerDisplayName)}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.avatarSpacer} />
                  )}
                  <View
                    style={[
                      styles.bubble,
                      mine ? styles.mine : styles.theirs,
                      mine && startsGroup ? styles.mineFirst : null,
                      mine && endsGroup ? styles.mineLast : null,
                      !mine && startsGroup ? styles.theirsFirst : null,
                      !mine && endsGroup ? styles.theirsLast : null
                    ]}
                  >
                    {automatic ? (
                      <View style={styles.autoLabel}>
                        <Ionicons name="sparkles" size={12} color={mine ? colors.secondaryContainer : colors.secondary} />
                        <Text variant="caption" color={mine ? colors.secondaryContainer : colors.secondary}>
                          Автомат хариу
                        </Text>
                      </View>
                    ) : null}
                    <Text color={mine ? colors.onPrimary : colors.onSurface} style={styles.messageText}>
                      {message.body}
                    </Text>
                    <View style={[styles.timeRow, mine ? styles.mineTimeRow : styles.theirsTimeRow]}>
                      <Text variant="caption" color={mine ? colors.secondaryContainer : colors.outline}>
                        {formatTime(message.created_at)}
                      </Text>
                      {mine ? <Ionicons name="checkmark-done" size={13} color={colors.secondaryContainer} /> : null}
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <GlassSurface style={styles.composer} contentStyle={styles.composerContent} intensity={40}>
          <Pressable accessibilityRole="button" accessibilityLabel="Хавсралт нэмэх" style={styles.toolButton}>
            <Ionicons name="add" size={22} color={colors.primary} />
          </Pressable>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Мессеж бичих"
            placeholderTextColor={colors.outline}
            multiline
            style={styles.input}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Мессеж илгээх"
            disabled={!canSend}
            onPress={send}
            style={({ pressed }) => [styles.sendButton, pressed ? styles.pressed : null, !canSend ? styles.disabled : null]}
          >
            {sendMessage.isPending ? (
              <Ionicons name="ellipsis-horizontal" size={20} color={colors.onPrimary} />
            ) : (
              <Ionicons name="arrow-up" size={20} color={colors.onPrimary} />
            )}
          </Pressable>
        </GlassSurface>

        <View style={styles.threadMeta}>
          <Ionicons name="lock-closed" size={12} color={colors.outline} />
          <Text variant="caption" color={colors.outline} numberOfLines={1}>
            Захиалга #{route.params.appointmentId.slice(0, 8)}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: { padding: 12, paddingBottom: 8 },
  wrap: { flex: 1, gap: 10 },
  header: {
    borderRadius: 28
  },
  headerContent: {
    minHeight: 66,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceContainerLow
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  smallAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6
  },
  avatarSpacer: {
    width: 32
  },
  avatarText: {
    textTransform: "uppercase"
  },
  headerText: {
    flex: 1,
    gap: 2
  },
  statusPill: {
    minHeight: 28,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9
  },
  statusConnected: {
    backgroundColor: "#dff3e3"
  },
  statusFallback: {
    backgroundColor: "#fff3d6"
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4
  },
  dotConnected: {
    backgroundColor: colors.success
  },
  dotFallback: {
    backgroundColor: colors.warning
  },
  messages: {
    flex: 1
  },
  messageContent: {
    paddingTop: 4,
    paddingBottom: 12
  },
  dayDivider: {
    alignSelf: "center",
    borderRadius: 999,
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginVertical: 10
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    width: "100%"
  },
  mineRow: {
    justifyContent: "flex-end"
  },
  theirsRow: {
    justifyContent: "flex-start"
  },
  groupStart: {
    marginTop: 8
  },
  groupTight: {
    marginTop: 3
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 9,
    gap: 5
  },
  mine: {
    alignSelf: "flex-end",
    backgroundColor: colors.primary
  },
  theirs: {
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant
  },
  mineFirst: {
    borderTopRightRadius: 8
  },
  mineLast: {
    borderBottomRightRadius: 8
  },
  theirsFirst: {
    borderTopLeftRadius: 8
  },
  theirsLast: {
    borderBottomLeftRadius: 8
  },
  autoLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  messageText: {
    lineHeight: 21
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  mineTimeRow: {
    justifyContent: "flex-end"
  },
  theirsTimeRow: {
    justifyContent: "flex-start"
  },
  composer: {
    borderRadius: 26
  },
  composerContent: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-end",
    padding: 6
  },
  toolButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceContainerLow
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 118,
    borderRadius: 21,
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.onSurface,
    fontSize: 15
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary
  },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.45 },
  threadMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingBottom: 2
  }
});
