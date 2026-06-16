import { Alert } from "react-native";
import { apiFetch } from "@/api/client";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { useAuthStore } from "@/state/authStore";
import { colors } from "@/theme/colors";

export function ClientSettingsScreen() {
  const { user, signOut } = useAuthStore();

  async function deleteAccount() {
    try {
      await apiFetch("/users/me", { method: "DELETE" });
      await signOut();
    } catch (error) {
      Alert.alert("Бүртгэл устгаж чадсангүй", error instanceof Error ? error.message : "Дахин оролдоно уу");
    }
  }

  return (
    <Screen>
      <Text variant="headline" color={colors.primary}>
        Тохиргоо
      </Text>
      <Card style={{ gap: 12, marginTop: 16 }}>
        <Text variant="label">{user?.username}</Text>
        <Text color={colors.onSurfaceVariant}>{user?.email}</Text>
        <Text color={colors.onSurfaceVariant}>{user?.phone_number}</Text>
        <Button title="Гарах" variant="secondary" onPress={signOut} />
        <Button title="Бүртгэл устгах" variant="ghost" onPress={deleteAccount} />
      </Card>
    </Screen>
  );
}
