import { useEffect, useMemo, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, View } from "react-native";
import { Button } from "@/components/Button";
import { BackButton } from "@/components/BackButton";
import { Card } from "@/components/Card";
import { Rating } from "@/components/Rating";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { useLawyer } from "@/api/queries";
import { colors } from "@/theme/colors";
import type { ClientStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<ClientStackParamList, "BookConsultation">;

const defaultTimeSlots = ["09:00", "09:30", "13:00", "13:30", "14:00", "14:30", "15:00"];
const dayKeys = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function toLocalIsoWithOffset(value: Date) {
  const pad = (input: number) => String(input).padStart(2, "0");
  const offsetMinutes = -value.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absOffset = Math.abs(offsetMinutes);
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(
    value.getMinutes()
  )}:00${sign}${pad(Math.floor(absOffset / 60))}:${pad(absOffset % 60)}`;
}

export function BookConsultationScreen({ route, navigation }: Props) {
  const lawyer = useLawyer(route.params.lawyerId);
  const availability = lawyer.data?.availability || {};
  const availableWeekdays = Array.isArray(availability.weekdays) ? availability.weekdays.map(String) : [];
  const timeSlots: string[] =
    Array.isArray(availability.slots) && availability.slots.length ? availability.slots.map(String) : defaultTimeSlots;
  const dates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 21 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index + 1);
      return date;
    }).filter((item) => {
      if (!availableWeekdays.length) return true;
      return availableWeekdays.includes(dayKeys[item.getDay()]);
    }).slice(0, 8);
  }, [availableWeekdays.join("|")]);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState(defaultTimeSlots[0]);

  useEffect(() => {
    if (dates.length && (!date || !dates.some((item) => item.toDateString() === date.toDateString()))) {
      setDate(dates[0]);
    }
    if (timeSlots.length && !timeSlots.includes(time)) {
      setTime(timeSlots[0]);
    }
  }, [dates, timeSlots, date, time]);

  const selectedDateTime = useMemo(() => {
    if (!date || !time) return null;
    const [hours, minutes] = time.split(":").map(Number);
    const next = new Date(date);
    next.setHours(hours, minutes, 0, 0);
    return toLocalIsoWithOffset(next);
  }, [date, time]);

  return (
    <Screen
      footer={
        <View style={styles.footer}>
          <Button
            title="Төлбөр рүү үргэлжлүүлэх"
            icon="card"
            onPress={() =>
              selectedDateTime &&
              navigation.navigate("PaymentCheckout", {
                lawyerId: route.params.lawyerId,
                categoryId: route.params.categoryId,
                dateTime: selectedDateTime
              })
            }
            disabled={!selectedDateTime || dates.length === 0 || timeSlots.length === 0}
          />
        </View>
      }
    >
      <BackButton onPress={() => navigation.goBack()} />
      <Text variant="headline" color={colors.primary}>
        Зөвлөгөө захиалах
      </Text>
      {lawyer.data ? (
        <Card style={styles.summary}>
          <View style={styles.avatar}>
            <Text variant="title" color={colors.onPrimary}>
              {lawyer.data.username.slice(0, 1)}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="title">{lawyer.data.username}</Text>
            <Text variant="caption" color={colors.onSurfaceVariant}>
              {lawyer.data.credentials}
            </Text>
            <Rating value={lawyer.data.avg_rating} count={lawyer.data.review_count} />
          </View>
        </Card>
      ) : null}
      <Text variant="title" color={colors.primary} style={styles.section}>
        Өдөр сонгох
      </Text>
      <View style={styles.dateRow}>
        {dates.map((item) => {
          const active = item.toDateString() === date?.toDateString();
          return (
            <Pressable key={item.toISOString()} onPress={() => setDate(item)} style={[styles.date, active && styles.activeDate]}>
              <Text variant="caption" color={active ? colors.onPrimary : colors.onSurfaceVariant}>
                {item.toLocaleDateString("mn-MN", { weekday: "short" })}
              </Text>
              <Text variant="title" color={active ? colors.onPrimary : colors.primary}>
                {item.getDate()}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {dates.length === 0 ? (
        <Text color={colors.onSurfaceVariant}>Энэ хуульч дараагийн гурван долоо хоногт боломжит өдөр нээгээгүй байна.</Text>
      ) : null}
      <Text variant="title" color={colors.primary} style={styles.section}>
        Боломжит цагууд
      </Text>
      <View style={styles.timeGrid}>
        {timeSlots.map((slot: string) => {
          const active = slot === time;
          return (
            <Pressable key={slot} onPress={() => setTime(slot)} style={[styles.time, active && styles.activeTime]}>
              <Text variant="label" color={active ? colors.onSecondaryContainer : colors.onSurfaceVariant}>
                {slot}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Card style={styles.session}>
        <Text variant="caption" color={colors.onSurfaceVariant}>
          ЗӨВЛӨГӨӨНИЙ ХУРААНГУЙ
        </Text>
        <Text>{selectedDateTime ? new Date(selectedDateTime).toLocaleString("mn-MN") : "Өдөр, цаг сонгоно уу"}</Text>
        <Text variant="title" color={colors.primary}>
          {lawyer.data?.price_per_consultation.toLocaleString()} {lawyer.data?.currency}
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 16 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  section: { marginTop: 22, marginBottom: 12 },
  dateRow: { flexDirection: "row", gap: 8 },
  date: {
    width: 60,
    height: 78,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: "center",
    justifyContent: "center",
    gap: 4
  },
  activeDate: { backgroundColor: colors.primary, borderColor: colors.primary },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  time: {
    width: "31%",
    minHeight: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: "center",
    justifyContent: "center"
  },
  activeTime: { backgroundColor: colors.secondaryContainer, borderColor: colors.secondary },
  session: { marginTop: 24, gap: 6 },
  footer: { padding: 20, backgroundColor: colors.surfaceContainerLowest, borderTopWidth: 1, borderTopColor: colors.outlineVariant }
});
