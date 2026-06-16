import { Platform } from "react-native";
import { apiFetch } from "@/api/client";

type TokenResponse = {
  app_id: string;
  channel_name: string;
  user_id: string;
  token: string;
  expires_in: number;
};

type AgoraRtmClient = {
  login: (options: { token: string }) => Promise<unknown>;
  logout: () => Promise<unknown>;
  subscribe: (channelName: string, options?: { withMessage?: boolean; withPresence?: boolean }) => Promise<unknown>;
  unsubscribe: (channelName: string) => Promise<unknown>;
  publish: (channelName: string, message: string, options?: { customType?: string }) => Promise<unknown>;
  addEventListener: (event: string, listener: (event: unknown) => void) => void;
  removeEventListener?: (event: string, listener: (event: unknown) => void) => void;
};

export type AgoraRtmSession = {
  connected: boolean;
  unavailableReason?: string;
  channelName?: string;
  publish: (message: string) => Promise<void>;
  cleanup: () => Promise<void>;
};

export async function connectAgoraRtm(
  appointmentId: string,
  onMessage: () => void,
  onStatus?: (status: string) => void
): Promise<AgoraRtmSession> {
  if (Platform.OS !== "web") {
    return {
      connected: false,
      unavailableReason: "Agora RTM Web SDK нь Expo Go native дээр ажиллахгүй тул сервер чат ашиглаж байна.",
      publish: async () => {},
      cleanup: async () => {}
    };
  }

  const token = await apiFetch<TokenResponse>(`/chats/appointments/${appointmentId}/rtm-token`);
  const AgoraRTM = await import("agora-rtm");
  const RTMConstructor = (AgoraRTM.default as unknown as { RTM: new (appId: string, userId: string, config?: { logLevel?: string }) => AgoraRtmClient }).RTM;
  const client = new RTMConstructor(token.app_id, token.user_id, { logLevel: "warn" });

  const messageListener = (event: unknown) => {
    const customType = typeof event === "object" && event && "customType" in event ? String((event as { customType?: unknown }).customType) : "";
    if (customType === "chat.message") onMessage();
  };
  const statusListener = (event: unknown) => {
    if (typeof event === "object" && event && "state" in event) {
      onStatus?.(String((event as { state?: unknown }).state));
    }
  };

  client.addEventListener("message", messageListener);
  client.addEventListener("status", statusListener);
  await client.login({ token: token.token });
  await client.subscribe(token.channel_name, { withMessage: true, withPresence: true });
  onStatus?.("CONNECTED");

  return {
    connected: true,
    channelName: token.channel_name,
    publish: async (message: string) => {
      await client.publish(token.channel_name, message, { customType: "chat.message" });
    },
    cleanup: async () => {
      client.removeEventListener?.("message", messageListener);
      client.removeEventListener?.("status", statusListener);
      await client.unsubscribe(token.channel_name).catch(() => {});
      await client.logout().catch(() => {});
    }
  };
}
