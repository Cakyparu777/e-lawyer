import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { colors } from "@/theme/colors";
import type { AuthStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Onboarding">;

export function OnboardingScreen({ navigation }: Props) {
  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Ionicons name="shield-checkmark" size={20} color={colors.onPrimary} />
          </View>
          <Text variant="title" color={colors.primary}>
            e-Lawyer
          </Text>
        </View>

        <View style={styles.visualPanel}>
          <View style={styles.visualHeader}>
            <View style={styles.caseBadge}>
              <Ionicons name="lock-closed" size={16} color={colors.onSecondaryContainer} />
              <Text variant="caption" color={colors.onSecondaryContainer}>
                Баталгаажсан зөвлөгөө
              </Text>
            </View>
            <Ionicons name="ellipsis-horizontal" size={22} color={colors.outline} />
          </View>

          <View style={styles.visualCenter}>
            <View style={styles.gavelCircle}>
              <Ionicons name="hammer" size={48} color={colors.onPrimary} />
            </View>
            <View style={styles.trustRow}>
              <View style={styles.trustPill}>
                <Ionicons name="star" size={14} color={colors.star} />
                <Text variant="caption">4.9 дундаж үнэлгээ</Text>
              </View>
              <View style={styles.trustPill}>
                <Ionicons name="card" size={14} color={colors.secondary} />
                <Text variant="caption">Аюулгүй төлбөр</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.copy}>
          <Text variant="headline" color={colors.primary} style={styles.center}>
            Танд тохирох хуульчийг хурдан олоорой
          </Text>
          <Text color={colors.onSurfaceVariant} style={styles.center}>
            Баталгаажсан мэргэжилтнүүдээс сонгож, төлбөртэй зөвлөгөө захиалан цагийн мэдээллээ нэг дор удирдаарай.
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.roleButton} onPress={() => navigation.navigate("Register", { role: "CLIENT" })}>
            <View style={styles.roleIcon}>
              <Ionicons name="person" size={20} color={colors.secondary} />
            </View>
            <View style={styles.roleCopy}>
              <Text variant="label" color={colors.primary}>
                Үйлчлүүлэгчээр үргэлжлүүлэх
              </Text>
              <Text variant="caption" color={colors.onSurfaceVariant}>
                Хуульч хайж зөвлөгөө захиалах
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.outline} />
          </Pressable>

          <Pressable style={styles.roleButton} onPress={() => navigation.navigate("Register", { role: "LAWYER" })}>
            <View style={styles.roleIcon}>
              <Ionicons name="briefcase" size={20} color={colors.secondary} />
            </View>
            <View style={styles.roleCopy}>
              <Text variant="label" color={colors.primary}>
                Хуульчаар үргэлжлүүлэх
              </Text>
              <Text variant="caption" color={colors.onSurfaceVariant}>
                Профайл болон захиалгаа удирдах
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.outline} />
          </Pressable>

          <Button title="Нэвтрэх" variant="secondary" icon="log-in" onPress={() => navigation.navigate("Login")} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 720,
    justifyContent: "space-between",
    gap: 22
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  brandMark: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  visualPanel: {
    minHeight: 330,
    borderRadius: 28,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: 18,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
    elevation: 3
  },
  visualHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  caseBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.secondaryContainer,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  visualCenter: {
    alignItems: "center",
    gap: 22,
    paddingBottom: 10
  },
  gavelCircle: {
    width: 144,
    height: 144,
    borderRadius: 72,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 14 },
    shadowRadius: 28,
    elevation: 4
  },
  trustRow: {
    flexDirection: "row",
    gap: 8
  },
  trustPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: colors.surface
  },
  copy: {
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 8
  },
  center: {
    textAlign: "center"
  },
  actions: {
    gap: 10,
    marginBottom: 4
  },
  roleButton: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 14,
    padding: 14,
    backgroundColor: colors.surfaceContainerLowest
  },
  roleIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.secondaryContainer,
    alignItems: "center",
    justifyContent: "center"
  },
  roleCopy: {
    flex: 1,
    gap: 2
  }
});
