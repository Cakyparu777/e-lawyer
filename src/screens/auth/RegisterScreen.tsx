import { useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { TextField } from "@/components/TextField";
import { BackButton } from "@/components/BackButton";
import { useRegister } from "@/api/queries";
import { useAuthStore } from "@/state/authStore";
import { colors } from "@/theme/colors";
import type { AuthStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export function RegisterScreen({ route, navigation }: Props) {
  const [role, setRole] = useState<"CLIENT" | "LAWYER">(route.params?.role || "CLIENT");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const register = useRegister();
  const signIn = useAuthStore((state) => state.signIn);

  async function submit() {
    try {
      const result = await register.mutateAsync({
        role,
        username,
        email,
        phone_number: phone,
        password
      });
      await signIn(result.user, result.token.access_token);
      navigation.navigate("Otp", { devCode: result.dev_otp_code });
    } catch (error) {
      Alert.alert("Бүртгэл амжилтгүй", error instanceof Error ? error.message : "Мэдээллээ шалгаад дахин оролдоно уу");
    }
  }

  return (
    <Screen>
      <BackButton onPress={() => navigation.goBack()} />
      <Card style={styles.card}>
        <View style={styles.brandRow}>
          <BrandLogo size={44} />
          <View style={styles.brandCopy}>
            <Text variant="caption" color={colors.onSurfaceVariant}>
              e-Lawyer
            </Text>
            <Text variant="headline" color={colors.primary}>
              Бүртгэл үүсгэх
            </Text>
          </View>
        </View>
        <Text color={colors.onSurfaceVariant}>Өөрийн үүргийг сонгоно уу. Апп танд тохирсон ажлын хэсгийг харуулна.</Text>
        <View style={styles.segment}>
          {(["CLIENT", "LAWYER"] as const).map((item) => (
            <Pressable
              key={item}
              onPress={() => setRole(item)}
              style={[styles.segmentItem, role === item ? styles.segmentActive : null]}
            >
              <Text variant="label" color={role === item ? colors.onPrimary : colors.onSurfaceVariant}>
                {item === "CLIENT" ? "Үйлчлүүлэгч" : "Хуульч"}
              </Text>
            </Pressable>
          ))}
        </View>
        <TextField label="Хэрэглэгчийн нэр" icon="person" value={username} onChangeText={setUsername} />
        <TextField label="Имэйл" icon="mail" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <TextField label="Утасны дугаар" icon="call" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <TextField label="Нууц үг" icon="lock-closed" value={password} onChangeText={setPassword} secureTextEntry />
        <Button title="Бүртгэл үүсгэх" icon="arrow-forward" loading={register.isPending} onPress={submit} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: 16, marginTop: 40 },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  brandCopy: {
    flex: 1,
    gap: 2
  },
  segment: {
    flexDirection: "row",
    padding: 4,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 10
  },
  segmentItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 8
  },
  segmentActive: {
    backgroundColor: colors.primary
  }
});
