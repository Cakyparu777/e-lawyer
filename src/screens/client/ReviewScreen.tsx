import { useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/Button";
import { BackButton } from "@/components/BackButton";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { TextField } from "@/components/TextField";
import { useCreateReview } from "@/api/queries";
import { colors } from "@/theme/colors";
import type { ClientStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<ClientStackParamList, "Review">;

export function ReviewScreen({ route, navigation }: Props) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const createReview = useCreateReview();

  async function submit() {
    try {
      await createReview.mutateAsync({ appointment_id: route.params.appointmentId, rating, text });
      navigation.goBack();
    } catch (error) {
      Alert.alert("Үнэлгээ үлдээх боломжгүй", error instanceof Error ? error.message : "Энэ захиалга үнэлгээ авах нөхцөл хангаагүй байна.");
    }
  }

  return (
    <Screen>
      <BackButton onPress={() => navigation.goBack()} />
      <Card style={styles.card}>
        <Text variant="headline" color={colors.primary}>
          Үнэлгээ үлдээх
        </Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((value) => (
            <Pressable key={value} onPress={() => setRating(value)}>
              <Ionicons name={value <= rating ? "star" : "star-outline"} size={34} color={colors.star} />
            </Pressable>
          ))}
        </View>
        <TextField label="Сэтгэгдэл" value={text} onChangeText={setText} multiline style={styles.input} />
        <Button title="Үнэлгээ илгээх" loading={createReview.isPending} onPress={submit} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: 16, marginTop: 50 },
  stars: { flexDirection: "row", gap: 6 },
  input: { minHeight: 110, textAlignVertical: "top" }
});
