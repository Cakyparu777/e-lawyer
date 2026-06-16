import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { apiFetch, apiUpload } from "@/api/client";
import { useCategories } from "@/api/queries";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { TextField } from "@/components/TextField";
import { pickLocalized } from "@/i18n/categories";
import { useAuthStore } from "@/state/authStore";
import { colors } from "@/theme/colors";
import type { Category, Lawyer } from "@/types/domain";

const weekdays = [
  { key: "MON", label: "Дав" },
  { key: "TUE", label: "Мяг" },
  { key: "WED", label: "Лха" },
  { key: "THU", label: "Пүр" },
  { key: "FRI", label: "Баа" },
  { key: "SAT", label: "Бям" },
  { key: "SUN", label: "Ням" }
];

const availableSlots = ["09:00", "09:30", "10:00", "10:30", "13:00", "13:30", "14:00", "14:30", "15:00", "16:00"];

export function LawyerProfileEditorScreen() {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const categories = useCategories();
  const [bio, setBio] = useState("");
  const [credentials, setCredentials] = useState("");
  const [price, setPrice] = useState("150000");
  const [selected, setSelected] = useState<string[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>(["MON", "TUE", "WED", "THU", "FRI"]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>(["09:00", "09:30", "13:00", "13:30", "14:00", "14:30", "15:00"]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch<Lawyer>("/lawyers/me/profile")
      .then((profile) => {
        setBio(profile.bio);
        setCredentials(profile.credentials);
        setPrice(String(profile.price_per_consultation));
        setSelected(profile.categories);
        setPhotoUrl(profile.photo_url || null);
        const savedWeekdays = Array.isArray(profile.availability.weekdays) ? profile.availability.weekdays : [];
        const savedSlots = Array.isArray(profile.availability.slots) ? profile.availability.slots : [];
        if (savedWeekdays.length) setSelectedWeekdays(savedWeekdays.map(String));
        if (savedSlots.length) setSelectedSlots(savedSlots.map(String));
      })
      .catch(() => {
        // A new lawyer may not have a profile yet; keep sensible defaults.
      });
  }, []);

  function toggle(id: string) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function toggleWeekday(day: string) {
    setSelectedWeekdays((current) => (current.includes(day) ? current.filter((item) => item !== day) : [...current, day]));
  }

  function toggleSlot(slot: string) {
    setSelectedSlots((current) => (current.includes(slot) ? current.filter((item) => item !== slot) : [...current, slot]));
  }

  async function save() {
    if (selectedWeekdays.length === 0 || selectedSlots.length === 0) {
      Alert.alert("Боломжит цаг шаардлагатай", "Дор хаяж нэг өдөр болон нэг цаг сонгоно уу.");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/lawyers/me/profile", {
        method: "PUT",
        body: JSON.stringify({
          bio,
          credentials,
          photo_url: photoUrl,
          categories: selected,
          price_per_consultation: Number(price),
          currency: "MNT",
          availability: {
            timezone: "Asia/Ulaanbaatar",
            weekdays: weekdays.map((day) => day.key).filter((day) => selectedWeekdays.includes(day)),
            slots: availableSlots.filter((slot) => selectedSlots.includes(slot))
          }
        })
      });
      Alert.alert("Хадгалагдлаа", "Таны хуульчийн профайл бэлэн боллоо.");
    } catch (error) {
      Alert.alert("Хадгалж чадсангүй", error instanceof Error ? error.message : "Шаардлагатай талбаруудыг шалгана уу");
    } finally {
      setLoading(false);
    }
  }

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    const formData = new FormData();
    formData.append("file", {
      uri: asset.uri,
      name: asset.fileName || "lawyer-photo.jpg",
      type: asset.mimeType || "image/jpeg"
    } as unknown as Blob);
    try {
      const response = await apiUpload<{ photo_url: string }>("/uploads/lawyer-photo", formData);
      setPhotoUrl(response.photo_url);
    } catch (error) {
      Alert.alert("Зураг оруулахад алдаа гарлаа", error instanceof Error ? error.message : "Өөр зураг сонгоно уу");
    }
  }

  return (
    <Screen>
      <Text variant="headline" color={colors.primary}>
        Хуульчийн профайл
      </Text>
      <Card style={styles.card}>
        <Pressable style={styles.photo} onPress={pickPhoto}>
          <Ionicons name="camera" size={24} color={colors.secondary} />
          <Text variant="caption" color={colors.onSurfaceVariant}>
            {photoUrl ? "Зураг орсон" : "Зураг оруулах"}
          </Text>
        </Pressable>
        <TextField label="Мэргэжлийн мэдээлэл" value={credentials} onChangeText={setCredentials} placeholder="Өмгөөлөгчийн холбоо, компани, лиценз..." />
        <TextField label="Товч танилцуулга" value={bio} onChangeText={setBio} multiline style={styles.bio} />
        <TextField label="Зөвлөгөөний үнэ" value={price} onChangeText={setPrice} keyboardType="number-pad" />
        <Text variant="label">Чиглэлүүд</Text>
        <View style={styles.chips}>
          {categories.data?.map((category: Category) => {
            const active = selected.includes(category.id);
            return (
              <Pressable key={category.id} onPress={() => toggle(category.id)} style={[styles.chip, active && styles.chipActive]}>
                <Text variant="caption" color={active ? colors.onPrimary : colors.onSurfaceVariant}>
                  {pickLocalized(category.name)}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text variant="label">Боломжит өдрүүд</Text>
        <View style={styles.dayGrid}>
          {weekdays.map((day) => {
            const active = selectedWeekdays.includes(day.key);
            return (
              <Pressable key={day.key} onPress={() => toggleWeekday(day.key)} style={[styles.dayChip, active && styles.chipActive]}>
                <Text variant="caption" color={active ? colors.onPrimary : colors.onSurfaceVariant}>
                  {day.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text variant="label">Боломжит цагууд</Text>
        <View style={styles.chips}>
          {availableSlots.map((slot) => {
            const active = selectedSlots.includes(slot);
            return (
              <Pressable key={slot} onPress={() => toggleSlot(slot)} style={[styles.timeChip, active && styles.chipActive]}>
                <Text variant="caption" color={active ? colors.onPrimary : colors.onSurfaceVariant}>
                  {slot}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Button title="Профайл хадгалах" loading={loading} onPress={save} />
      </Card>
      <Card style={styles.card}>
        <Text variant="label">{user?.username}</Text>
        <Text color={colors.onSurfaceVariant}>{user?.email}</Text>
        <Button title="Гарах" variant="secondary" onPress={signOut} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: 14, marginTop: 16 },
  photo: {
    height: 110,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.outlineVariant,
    alignItems: "center",
    justifyContent: "center",
    gap: 6
  },
  bio: { minHeight: 110, textAlignVertical: "top" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  dayGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: colors.surfaceContainerLowest
  },
  dayChip: {
    width: 54,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest
  },
  timeChip: {
    minWidth: 76,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary }
});
