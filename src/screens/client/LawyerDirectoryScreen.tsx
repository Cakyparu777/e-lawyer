import { useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, View } from "react-native";
import { Button } from "@/components/Button";
import { BackButton } from "@/components/BackButton";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Rating } from "@/components/Rating";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { TextField } from "@/components/TextField";
import { useLawyers } from "@/api/queries";
import { colors } from "@/theme/colors";
import type { Lawyer } from "@/types/domain";
import type { ClientStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<ClientStackParamList, "LawyerDirectory">;

export function LawyerDirectoryScreen({ route, navigation }: Props) {
  const [search, setSearch] = useState("");
  const lawyers = useLawyers(route.params.categoryId, search);

  return (
    <Screen>
      <View style={styles.top}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text variant="headline" color={colors.primary}>
          {route.params.categoryName}
        </Text>
      </View>
      <TextField label="Хуульч хайх" icon="search" value={search} onChangeText={setSearch} />
      {lawyers.isLoading ? <EmptyState title="Хуульчдыг ачаалж байна..." /> : null}
      {lawyers.data?.length === 0 ? <EmptyState title="Хуульч олдсонгүй" body="Өөр хайлтын үг оруулж үзнэ үү." /> : null}
      <View style={styles.list}>
        {lawyers.data?.map((lawyer: Lawyer) => (
          <Pressable
            key={lawyer.user_id}
            onPress={() =>
              navigation.navigate("LawyerProfile", { lawyerId: lawyer.user_id, categoryId: route.params.categoryId })
            }
          >
            <Card style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.avatar}>
                  <Text variant="title" color={colors.onPrimary}>
                    {lawyer.username.slice(0, 1)}
                  </Text>
                </View>
                <View style={styles.info}>
                  <View style={styles.nameRow}>
                    <Text variant="title" color={colors.primary} numberOfLines={1}>
                      {lawyer.username}
                    </Text>
                    <Rating value={lawyer.avg_rating} />
                  </View>
                  <Text variant="caption" color={colors.onSurfaceVariant}>
                    {lawyer.credentials}
                  </Text>
                </View>
              </View>
              <Text numberOfLines={2}>{lawyer.bio}</Text>
              <View style={styles.footer}>
                <View>
                  <Text variant="caption" color={colors.onSurfaceVariant}>
                    Зөвлөгөө
                  </Text>
                  <Text variant="title" color={colors.primary}>
                    {lawyer.price_per_consultation.toLocaleString()} {lawyer.currency}
                  </Text>
                </View>
                <Button
                  title="Захиалах"
                  onPress={() =>
                    navigation.navigate("BookConsultation", {
                      lawyerId: lawyer.user_id,
                      categoryId: route.params.categoryId
                    })
                  }
                />
              </View>
            </Card>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  list: { gap: 12, marginTop: 16 },
  card: { gap: 12 },
  cardTop: { flexDirection: "row", gap: 12 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  info: { flex: 1, justifyContent: "center" },
  nameRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  }
});
