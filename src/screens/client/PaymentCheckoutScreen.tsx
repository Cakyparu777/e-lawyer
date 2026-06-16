import { useEffect, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Alert, StyleSheet, View } from "react-native";
import { Button } from "@/components/Button";
import { BackButton } from "@/components/BackButton";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { useCheckout, useConfirmPayment, useLawyer } from "@/api/queries";
import { colors } from "@/theme/colors";
import type { CheckoutResponse } from "@/types/domain";
import type { ClientStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<ClientStackParamList, "PaymentCheckout">;

export function PaymentCheckoutScreen({ route, navigation }: Props) {
  const lawyer = useLawyer(route.params.lawyerId);
  const checkout = useCheckout();
  const confirm = useConfirmPayment();
  const [intent, setIntent] = useState<CheckoutResponse | null>(null);

  useEffect(() => {
    checkout
      .mutateAsync({
        lawyer_id: route.params.lawyerId,
        category_id: route.params.categoryId,
        date_time: route.params.dateTime,
        provider: "mock"
      })
      .then(setIntent)
      .catch((error) => Alert.alert("Төлбөрийн мэдээлэл үүссэнгүй", error instanceof Error ? error.message : "Дахин оролдоно уу"));
  }, []);

  async function pay() {
    if (!intent) return;
    try {
      await confirm.mutateAsync(intent.payment_id);
      navigation.replace("BookingConfirmed", { appointmentId: intent.appointment_id });
    } catch (error) {
      Alert.alert("Төлбөр амжилтгүй", error instanceof Error ? error.message : "Дахин оролдоно уу");
    }
  }

  return (
    <Screen>
      <BackButton onPress={() => navigation.goBack()} />
      <Text variant="headline" color={colors.primary}>
        Төлбөр төлөх
      </Text>
      <Card style={styles.card}>
        <Text variant="caption" color={colors.onSurfaceVariant}>
          ЗӨВЛӨГӨӨ
        </Text>
        <Text variant="title">{lawyer.data?.username || "Хуульчийн зөвлөгөө"}</Text>
        <Text color={colors.onSurfaceVariant}>{new Date(route.params.dateTime).toLocaleString("mn-MN")}</Text>
        <View style={styles.total}>
          <Text variant="label">Нийт</Text>
          <Text variant="headline" color={colors.primary}>
            {intent?.amount.toLocaleString() || lawyer.data?.price_per_consultation.toLocaleString()}{" "}
            {intent?.currency || lawyer.data?.currency}
          </Text>
        </View>
      </Card>
      <Card style={styles.card}>
        <Text variant="label">Төлбөрийн суваг</Text>
        <Text color={colors.onSurfaceVariant}>
          Орон нутгийн хөгжүүлэлтэд туршилтын төлбөрийн суваг идэвхтэй байна. Тохиргоо бэлэн болмогц `stripe` эсвэл `qpay` болгож сольж болно.
        </Text>
      </Card>
      <Button
        title="Төлж баталгаажуулах"
        icon="lock-closed"
        loading={checkout.isPending || confirm.isPending}
        disabled={!intent}
        onPress={pay}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10, marginVertical: 12 },
  total: { borderTopWidth: 1, borderTopColor: colors.outlineVariant, paddingTop: 12, gap: 4 }
});
