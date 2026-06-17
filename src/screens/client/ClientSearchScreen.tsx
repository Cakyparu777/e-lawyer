import { useMemo, useState } from "react";
import type { NativeBottomTabScreenProps } from "@react-navigation/bottom-tabs/unstable";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { TextField } from "@/components/TextField";
import { useCategories } from "@/api/queries";
import { pickLocalized } from "@/i18n/categories";
import { colors } from "@/theme/colors";
import type { ClientStackParamList, ClientTabParamList } from "@/navigation/types";
import type { Category } from "@/types/domain";

type Props = CompositeScreenProps<
  NativeBottomTabScreenProps<ClientTabParamList, "ClientSearch">,
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

export function ClientSearchScreen({ navigation }: Props) {
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
      <Text variant="headline" color={colors.primary}>
        Хайх
      </Text>
      <Text color={colors.onSurfaceVariant}>Эрх зүйн чиглэлээр хайж, тохирох хуульчдыг харна уу.</Text>

      <View style={styles.searchWrap}>
        <TextField
          label="Хайх"
          icon="search"
          value={search}
          onChangeText={setSearch}
          placeholder="Чиглэл, хуульч эсвэл эрх зүйн сэдэв"
        />
      </View>

      {categories.isLoading ? <EmptyState title="Чиглэлүүдийг ачаалж байна..." /> : null}
      {categories.isError ? <EmptyState title="Чиглэлүүдийг ачаалж чадсангүй" body="API холболтоо шалгана уу." /> : null}
      {!categories.isLoading && visibleCategories.length === 0 ? (
        <EmptyState title="Илэрц олдсонгүй" body="Илүү богино хайлтын үг оруулна уу." />
      ) : null}

      <View style={styles.list}>
        {visibleCategories.map((category: Category) => (
          <Pressable
            key={category.id}
            style={styles.result}
            onPress={() =>
              navigation.navigate("LawyerDirectory", {
                categoryId: category.id,
                categoryName: pickLocalized(category.name)
              })
            }
          >
            <View style={styles.icon}>
              <Ionicons name={categoryIcons[category.id] || "briefcase-outline"} size={22} color={colors.onSecondaryContainer} />
            </View>
            <View style={styles.resultText}>
              <Text variant="label" color={colors.primary}>
                {pickLocalized(category.name)}
              </Text>
              <Text variant="caption" color={colors.onSurfaceVariant} numberOfLines={2}>
                {pickLocalized(category.description)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.outline} />
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    marginTop: 18,
    marginBottom: 16
  },
  list: {
    gap: 10
  },
  result: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 78,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    padding: 12
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondaryContainer,
    alignItems: "center",
    justifyContent: "center"
  },
  resultText: {
    flex: 1,
    gap: 3
  }
});
