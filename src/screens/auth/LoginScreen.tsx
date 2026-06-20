import { useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from "react-native";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { TextField } from "@/components/TextField";
import { useLogin } from "@/api/queries";
import { useAuthStore } from "@/state/authStore";
import { colors } from "@/theme/colors";
import type { AuthStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();
  const signIn = useAuthStore((state) => state.signIn);

  async function submit() {
    if (!email.trim() || !password) {
      Alert.alert("Мэдээлэл дутуу байна", "Үргэлжлүүлэхийн тулд имэйл болон нууц үгээ оруулна уу.");
      return;
    }

    try {
      const result = await login.mutateAsync({ email: email.trim(), password });
      await signIn(result.user, result.token.access_token);
    } catch (error) {
      Alert.alert("Нэвтрэхэд алдаа гарлаа", error instanceof Error ? error.message : "Дахин оролдоно уу");
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.wrap}>
        <View style={styles.brandBlock}>
          <BrandLogo size={72} style={styles.logoShadow} />
          <Text variant="headline" color={colors.primary} style={styles.centerText}>
            Тавтай морил
          </Text>
          <Text color={colors.onSurfaceVariant} style={styles.centerText}>
            Зөвлөгөө, захиалга, хууль зүйн профайлдаа аюулгүй нэвтэрнэ үү.
          </Text>
        </View>

        <View style={styles.formSurface}>
          <View style={styles.formHeader}>
            <Text variant="title" color={colors.primary}>
              Нэвтрэх
            </Text>
            <Text variant="caption" color={colors.onSurfaceVariant}>
              e-Lawyer бүртгэлийн имэйл болон нууц үгээ ашиглана уу.
            </Text>
          </View>

          <TextField
            label="Имэйл"
            icon="mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoComplete="email"
            placeholder="client@example.com"
          />
          <TextField
            label="Нууц үг"
            icon="lock-closed"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            placeholder="Нууц үг"
          />

          <Pressable style={styles.forgotButton} onPress={() => Alert.alert("Удахгүй", "Нууц үг сэргээх боломж дараагийн хувилбарт нэмэгдэнэ.")}>
            <Text variant="caption" color={colors.secondary}>
              Нууц үгээ мартсан уу?
            </Text>
          </Pressable>

          <Button title="Нэвтрэх" icon="arrow-forward" loading={login.isPending} onPress={submit} />
        </View>

        <View style={styles.signupRow}>
          <Text variant="caption" color={colors.onSurfaceVariant}>
            e-Lawyer-д шинэ үү?
          </Text>
          <Pressable onPress={() => navigation.navigate("Register")}>
            <Text variant="label" color={colors.secondary}>
              Бүртгэл үүсгэх
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: "center",
    minHeight: 680
  },
  brandBlock: {
    alignItems: "center",
    gap: 10,
    marginBottom: 28,
    paddingHorizontal: 16
  },
  logoShadow: {
    shadowColor: colors.primary,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 22,
    elevation: 4
  },
  centerText: {
    textAlign: "center"
  },
  formSurface: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 18,
    padding: 18,
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 2
  },
  formHeader: {
    gap: 4,
    marginBottom: 4
  },
  forgotButton: {
    alignSelf: "flex-end",
    paddingVertical: 2
  },
  signupRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 18
  }
});
