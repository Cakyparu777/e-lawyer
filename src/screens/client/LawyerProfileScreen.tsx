import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StyleSheet, View } from "react-native";
import { Button } from "@/components/Button";
import { BackButton } from "@/components/BackButton";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Rating } from "@/components/Rating";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { useLawyer, useReviews } from "@/api/queries";
import { colors } from "@/theme/colors";
import type { Review } from "@/types/domain";
import type { ClientStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<ClientStackParamList, "LawyerProfile">;

export function LawyerProfileScreen({ route, navigation }: Props) {
  const lawyer = useLawyer(route.params.lawyerId);
  const reviews = useReviews(route.params.lawyerId);

  if (lawyer.isLoading) return <Screen><EmptyState title="Профайлыг ачаалж байна..." /></Screen>;
  if (!lawyer.data) return <Screen><EmptyState title="Хуульч олдсонгүй" /></Screen>;

  return (
    <Screen>
      <BackButton onPress={() => navigation.goBack()} />
      <Card style={styles.hero}>
        <View style={styles.avatar}>
          <Text variant="headline" color={colors.onPrimary}>
            {lawyer.data.username.slice(0, 1)}
          </Text>
        </View>
        <Text variant="headline" color={colors.primary} style={styles.center}>
          {lawyer.data.username}
        </Text>
        <Rating value={lawyer.data.avg_rating} count={lawyer.data.review_count} />
        <Text color={colors.onSurfaceVariant} style={styles.center}>
          {lawyer.data.credentials}
        </Text>
        <Text style={styles.center}>{lawyer.data.bio}</Text>
        {route.params.categoryId ? (
          <Button
            title="Зөвлөгөө захиалах"
            icon="calendar"
            onPress={() =>
              navigation.navigate("BookConsultation", {
                lawyerId: lawyer.data.user_id,
                categoryId: route.params.categoryId as string
              })
            }
          />
        ) : null}
      </Card>
      <Text variant="title" color={colors.primary} style={styles.section}>
        Үнэлгээ
      </Text>
      {reviews.data?.map((review: Review) => (
        <Card key={review.id} style={styles.review}>
          <Rating value={review.rating} />
          <Text>{review.text}</Text>
        </Card>
      ))}
      {reviews.data?.length === 0 ? <EmptyState title="Одоогоор үнэлгээ алга" /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", gap: 12 },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  center: { textAlign: "center" },
  section: { marginTop: 24, marginBottom: 12 },
  review: { gap: 8, marginBottom: 10 }
});
