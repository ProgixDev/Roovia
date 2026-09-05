import { ScrollView, Pressable, StyleSheet, Text } from "react-native";

import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import type { TripDay } from "../../mocks/itineraries";

interface DaySelectorProps {
  days: TripDay[];
  activeDayId: string | null;
  onSelect: (dayId: string | null) => void;
}

/** `null` active = "Tous les jours" — the map draws the full route instead of one day's segment. */
export function DaySelector({ days, activeDayId, onSelect }: DaySelectorProps) {
  const { theme } = useTheme();

  const Chip = ({ selected, label, onPress }: { selected: boolean; label: string; onPress: () => void }) => (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: selected ? theme.colors.ink : theme.colors.surface, borderColor: selected ? theme.colors.ink : theme.colors.line },
      ]}
    >
      <Text style={[typography.button, { color: selected ? theme.colors.ground : theme.colors.ink, fontSize: 13 }]}>{label}</Text>
    </Pressable>
  );

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      <Chip selected={activeDayId === null} label="Tous" onPress={() => onSelect(null)} />
      {days.map((day) => (
        <Chip key={day.id} selected={activeDayId === day.id} label={`J${day.index}`} onPress={() => onSelect(day.id)} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  chip: { height: 36, paddingHorizontal: 16, borderRadius: radius.pill, borderWidth: 1, alignItems: "center", justifyContent: "center" },
});
