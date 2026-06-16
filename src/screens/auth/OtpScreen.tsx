import { useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Alert, StyleSheet } from "react-native";
import { apiFetch } from "@/api/client";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { TextField } from "@/components/TextField";
import { BackButton } from "@/components/BackButton";
import { colors } from "@/theme/colors";
import type { AuthStackParamList } from "@/navigation/types";
import { useAuthStore } from "@/state/authStore";
import type { User } from "@/types/domain";

type Props = NativeStackScreenProps<AuthStackParamList, "Otp">;

export function OtpScreen({ route }: Props) {
  const [code, setCode] = useState(route.params?.devCode || "");
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);
  const signOut = useAuthStore((state) => state.signOut);

  async function verify() {
    setLoading(true);
    try {
      await apiFetch("/auth/otp/verify", { method: "POST", body: JSON.stringify({ code }) });
      const user = await apiFetch<User>("/auth/me");
      await setUser(user);
      Alert.alert("Баталгаажлаа", "Таны утасны дугаар баталгаажлаа.");
    } catch (error) {
      Alert.alert("OTP амжилтгүй", error instanceof Error ? error.message : "Дахин оролдоно уу");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <BackButton onPress={signOut} />
      <Card style={styles.card}>
        <Text variant="headline" color={colors.primary}>
          Утас баталгаажуулах
        </Text>
        <Text color={colors.onSurfaceVariant}>
          Утсанд ирсэн OTP кодыг оруулна уу. Туршилтын горимд код 1234 байна.
        </Text>
        {!route.params?.devCode ? (
          <Button
            title="Шинэ OTP авах"
            variant="secondary"
            onPress={async () => {
              const response = await apiFetch<{ dev_otp_code?: string }>("/auth/otp/request", {
                method: "POST",
                body: JSON.stringify({ purpose: "PHONE_VERIFY" })
              });
              if (response.dev_otp_code) setCode(response.dev_otp_code);
            }}
          />
        ) : null}
        <TextField label="OTP код" icon="keypad" value={code} onChangeText={setCode} keyboardType="number-pad" />
        <Button title="Баталгаажуулах" loading={loading} onPress={verify} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 16,
    marginTop: 80
  }
});
