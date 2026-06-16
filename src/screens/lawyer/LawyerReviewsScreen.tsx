import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Rating } from "@/components/Rating";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { useReviews } from "@/api/queries";
import { useAuthStore } from "@/state/authStore";
import { colors } from "@/theme/colors";
import type { Review } from "@/types/domain";

export function LawyerReviewsScreen() {
  const user = useAuthStore((state) => state.user);
  const reviews = useReviews(user?.id || "");

  return (
    <Screen>
      <Text variant="headline" color={colors.primary}>
        Үнэлгээ
      </Text>
      {reviews.data?.length === 0 ? <EmptyState title="Одоогоор үнэлгээ алга" /> : null}
      {reviews.data?.map((review: Review) => (
        <Card key={review.id} style={{ gap: 8, marginTop: 12 }}>
          <Rating value={review.rating} />
          <Text>{review.text}</Text>
        </Card>
      ))}
    </Screen>
  );
}
