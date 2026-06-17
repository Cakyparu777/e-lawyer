import { useMemo, useState } from "react";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { NativeBottomTabScreenProps } from "@react-navigation/bottom-tabs/unstable";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { TextField } from "@/components/TextField";
import { useCategories } from "@/api/queries";
import { pickLocalized } from "@/i18n/categories";
import { useAuthStore } from "@/state/authStore";
import { colors } from "@/theme/colors";
import type { Category } from "@/types/domain";
import type { ClientStackParamList, ClientTabParamList } from "@/navigation/types";

type Props = CompositeScreenProps<
  NativeBottomTabScreenProps<ClientTabParamList, "ClientHome">,
  NativeStackScreenProps<ClientStackParamList>
>;

const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  "administrative-law": "business-outline",
  "business-corporate-law": "briefcase-outline",
  "civil-law": "reader-outline",
  "criminal-defense": "shield-checkmark-outline",
  "family-law": "people-outline",
  "labor-law": "construct-outline"
};

export function ClientHomeScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);
  const categories = useCategories();
  const [search, setSearch] = useState("");

  const visibleCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return categories.data || [];
    return (categories.data || []).filter((category: Category) => {
      const name = pickLocalized(category.name).toLowerCase();
      const description = pickLocalized(category.description).toLowerCase();
      return name.includes(query) || description.includes(query);
    });
  }, [categories.data, search]);

  return (
    <Screen>
      <View style={styles.appBar}>
        <View>
          <Text variant="caption" color={colors.onSurfaceVariant}>
            e-Lawyer
          </Text>
          <Text variant="title" color={colors.primary}>
            Сайн байна уу, {user?.username || "Үйлчлүүлэгч"}
          </Text>
        </View>
        <Pressable style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={21} color={colors.onSurfaceVariant} />
          <View style={styles.notificationDot} />
        </Pressable>
      </View>

      <Card style={styles.heroCard}>
        <View style={styles.heroIcon}>
          <Ionicons name="shield-checkmark" size={24} color={colors.onSecondaryContainer} />
        </View>
        <Text variant="headline" color={colors.primary}>
          Итгэлтэй хууль зүйн зөвлөгөө аваарай
        </Text>
        <Text color={colors.onSurfaceVariant}>
          Баталгаажсан хуульчдыг чиглэлээр нь хайж, тодорхой үнэтэй төлбөртэй зөвлөгөө захиалаарай.
        </Text>
      </Card>

      <View style={styles.searchWrap}>
        <TextField
          label="Хайх"
          icon="search"
          value={search}
          onChangeText={setSearch}
          placeholder="Чиглэл, хуульч эсвэл эрх зүйн сэдэв"
        />
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text variant="title" color={colors.primary}>
            Эрх зүйн чиглэлүүд
          </Text>
          <Text variant="caption" color={colors.onSurfaceVariant}>
            Өөрийн асуудалд хамгийн ойр чиглэлийг сонгоно уу.
          </Text>
        </View>
        <Text variant="caption" color={colors.secondary}>
          {visibleCategories.length} чиглэл
        </Text>
      </View>

      {categories.isLoading ? <EmptyState title="Чиглэлүүдийг ачаалж байна..." /> : null}
      {categories.isError ? <EmptyState title="Чиглэлүүдийг ачаалж чадсангүй" body="API холболтоо шалгана уу." /> : null}
      {!categories.isLoading && visibleCategories.length === 0 ? (
        <EmptyState title="Чиглэл олдсонгүй" body="Илүү богино хайлтын үг оруулна уу." />
      ) : null}
      <View style={styles.grid}>
        {visibleCategories.map((category: Category) => (
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
            <View style={styles.icon}>
              <Ionicons
                name={categoryIcons[category.id] || "briefcase-outline"}
                size={22}
                color={colors.onSecondaryContainer}
              />
            </View>
            <Text variant="label" color={colors.primary} numberOfLines={2}>
              {pickLocalized(category.name)}
            </Text>
            <Text variant="caption" color={colors.onSurfaceVariant} numberOfLines={4}>
              {pickLocalized(category.description)}
            </Text>
            <View style={styles.cardFooter}>
              <Text variant="caption" color={colors.secondary}>
                Хуульчид харах
              </Text>
              <Ionicons name="chevron-forward" size={14} color={colors.secondary} />
            </View>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  appBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: "center",
    justifyContent: "center"
  },
  notificationDot: {
    position: "absolute",
    top: 11,
    right: 12,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.error
  },
  heroCard: {
    gap: 10,
    marginBottom: 18,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainerLowest
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondaryContainer,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2
  },
  searchWrap: {
    marginBottom: 22
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
    gap: 12
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  category: {
    width: "48%",
    minHeight: 190,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 12,
    padding: 14,
    gap: 8,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.035,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 1
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondaryContainer,
    alignItems: "center",
    justifyContent: "center"
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 4
  }
});
