import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BackButton } from "@/components/BackButton";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
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

export function ChatScreen({ route, navigation }: Props) {
  const user = useAuthStore((state) => state.user);
  const thread = useChatThread(route.params.appointmentId);
  const sendMessage = useSendChatMessage();
  const [text, setText] = useState("");
  const [rtmStatus, setRtmStatus] = useState("SERVER_FALLBACK");
  const rtmSession = useRef<AgoraRtmSession | null>(null);

  const peerContact = useMemo(() => {
    if (!thread.data || !user) return null;
    return user.role === "CLIENT" ? thread.data.lawyer_contact_snapshot : thread.data.client_contact_snapshot;
  }, [thread.data, user]);

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
    <Screen scroll={false}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.wrap}>
        <View style={styles.header}>
          <BackButton onPress={navigation.goBack} />
          <View style={styles.headerText}>
            <Text variant="headline" color={colors.primary}>
              Чат
            </Text>
            <Text variant="caption" color={colors.onSurfaceVariant}>
              Захиалгын ID: {route.params.appointmentId.slice(0, 8)}
            </Text>
            <Text variant="caption" color={rtmStatus === "CONNECTED" ? colors.success : colors.onSurfaceVariant}>
              {rtmStatus === "CONNECTED" ? "Шууд холболт идэвхтэй" : "Серверээр шинэчилж байна"}
            </Text>
          </View>
        </View>

        {peerContact ? (
          <Card style={styles.contactCard}>
            <Text variant="label">{peerContact.username}</Text>
            <Text variant="caption" color={colors.onSurfaceVariant}>
              {peerContact.phoneNumber} | {peerContact.email}
            </Text>
          </Card>
        ) : null}

        {thread.isLoading ? <EmptyState title="Чатыг ачаалж байна..." /> : null}
        {thread.isError ? <EmptyState title="Чат нээгдсэнгүй" body="Төлбөр баталгаажсан эсэхийг шалгана уу." /> : null}

        <ScrollView style={styles.messages} contentContainerStyle={styles.messageContent} showsVerticalScrollIndicator={false}>
          {thread.data?.messages.length === 0 ? <EmptyState title="Одоогоор мессеж алга" /> : null}
          {thread.data?.messages.map((message: ChatMessage) => {
            const mine = message.sender_id === user?.id;
            const automatic = message.message_type === "AUTO_RESPONSE";
            return (
              <View key={message.id} style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                {automatic ? (
                  <Text variant="caption" color={mine ? colors.secondaryContainer : colors.secondary}>
                    Автомат хариу
                  </Text>
                ) : null}
                <Text color={mine ? colors.onPrimary : colors.onSurfaceVariant}>{message.body}</Text>
                <Text variant="caption" color={mine ? colors.secondaryContainer : colors.outline}>
                  {new Date(message.created_at).toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.inputRow}>
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
            disabled={!text.trim() || sendMessage.isPending}
            onPress={send}
            style={({ pressed }) => [styles.sendButton, pressed ? styles.pressed : null, !text.trim() ? styles.disabled : null]}
          >
            <Ionicons name="send" size={18} color={colors.onPrimary} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  header: { flexDirection: "row", gap: 4, alignItems: "flex-start" },
  headerText: { flex: 1 },
  contactCard: { gap: 4, marginBottom: 10 },
  messages: { flex: 1 },
  messageContent: { gap: 10, paddingVertical: 12 },
  bubble: {
    maxWidth: "82%",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4
  },
  mine: { alignSelf: "flex-end", backgroundColor: colors.primary },
  theirs: { alignSelf: "flex-start", backgroundColor: colors.surfaceContainerLow },
  inputRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-end",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.onSurface
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary
  },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.45 }
});
