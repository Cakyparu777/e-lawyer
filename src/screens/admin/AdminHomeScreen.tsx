import { Alert } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/api/client";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Rating } from "@/components/Rating";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { useAuthStore } from "@/state/authStore";
import { colors } from "@/theme/colors";
import type { Review } from "@/types/domain";

export function AdminHomeScreen() {
  const signOut = useAuthStore((state) => state.signOut);
  const reviews = useQuery({ queryKey: ["admin", "reviews"], queryFn: () => apiFetch<Review[]>("/admin/reviews") });

  async function moderate(id: string, isHidden: boolean) {
    try {
      await apiFetch(`/reviews/${id}/moderation?is_hidden=${isHidden}`, { method: "PATCH" });
      reviews.refetch();
    } catch (error) {
      Alert.alert("Модерац амжилтгүй", error instanceof Error ? error.message : "Дахин оролдоно уу");
    }
  }

  return (
    <Screen>
      <Text variant="headline" color={colors.primary}>
        Админ
      </Text>
      <Button title="Гарах" variant="secondary" onPress={signOut} />
      {reviews.data?.length === 0 ? <EmptyState title="Хянах үнэлгээ алга" /> : null}
      {reviews.data?.map((review: Review) => (
        <Card key={review.id} style={{ gap: 10, marginTop: 12 }}>
          <Rating value={review.rating} />
          <Text>{review.text}</Text>
          <Button
            title={review.is_hidden ? "Үнэлгээг сэргээх" : "Үнэлгээг нуух"}
            variant="secondary"
            onPress={() => moderate(review.id, !review.is_hidden)}
          />
        </Card>
      ))}
    </Screen>
  );
}
