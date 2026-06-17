import type { NativeBottomTabScreenProps } from "@react-navigation/bottom-tabs/unstable";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { useCategories } from "@/api/queries";
import { pickLocalized } from "@/i18n/categories";
import { colors } from "@/theme/colors";
import type { ClientStackParamList, ClientTabParamList } from "@/navigation/types";
import type { Category } from "@/types/domain";

type Props = CompositeScreenProps<
  NativeBottomTabScreenProps<ClientTabParamList, "ClientQuickBook">,
  NativeStackScreenProps<ClientStackParamList>
>;

export function ClientQuickBookScreen({ navigation }: Props) {
  const categories = useCategories();

  return (
    <Screen>
      <View style={styles.headerIcon}>
        <Ionicons name="add" size={26} color={colors.onPrimary} />
      </View>
      <Text variant="headline" color={colors.primary}>
        Зөвлөгөө захиалах
      </Text>
      <Text color={colors.onSurfaceVariant}>Асуудалдаа тохирох чиглэлээ сонгоод хуульчдын жагсаалт руу орно уу.</Text>

      {categories.isLoading ? <EmptyState title="Чиглэлүүдийг ачаалж байна..." /> : null}
      {categories.isError ? <EmptyState title="Чиглэлүүдийг ачаалж чадсангүй" body="API холболтоо шалгана уу." /> : null}

      <View style={styles.grid}>
        {categories.data?.map((category: Category) => (
          <Pressable
            key={category.id}
            style={styles.category}
            onPress={() =>
              navigation.navigate("LawyerDirectory", {
                categoryId: category.id,
                categoryName: pickLocalized(category.name)
              })
            }
          >
            <Text variant="label" color={colors.primary} numberOfLines={2}>
              {pickLocalized(category.name)}
            </Text>
            <View style={styles.actionRow}>
              <Text variant="caption" color={colors.secondary}>
                Хуульч сонгох
              </Text>
              <Ionicons name="arrow-forward" size={14} color={colors.secondary} />
            </View>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 20
  },
  category: {
    width: "48%",
    minHeight: 116,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    padding: 14,
    justifyContent: "space-between",
    gap: 12
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  }
});
