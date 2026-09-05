import { StyleSheet, Text, View } from "react-native";

import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import { fitIssues, type VehicleDimensions } from "../../lib/vehicleFit";
import type { Stop, TripDay } from "../../mocks/itineraries";
import { IncompatibilityBanner } from "./IncompatibilityBanner";
import { StopRow } from "./StopRow";

interface DayCardProps {
  day: TripDay;
  lockedStopIds: string[];
  activeVehicle: VehicleDimensions | null;
  onPressStop: (stop: Stop) => void;
  onToggleLock: (stopId: string) => void;
  onMoveStop: (stopId: string, direction: "up" | "down") => void;
  onRemoveStop: (stopId: string) => void;
}

export function DayCard({ day, lockedStopIds, activeVehicle, onPressStop, onToggleLock, onMoveStop, onRemoveStop }: DayCardProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
      <Text style={[typography.cardTitle, { color: theme.colors.ink }]}>Jour {day.index}</Text>

      {day.stops.map((stop, i) => {
        const issues =
          activeVehicle && stop.maxHeightM !== undefined
            ? fitIssues(activeVehicle, { maxHeightM: stop.maxHeightM })
            : [];

        return (
          <View key={stop.id}>
            <StopRow
              stop={stop}
              locked={lockedStopIds.includes(stop.id)}
              canMoveUp={i > 0}
              canMoveDown={i < day.stops.length - 1}
              onPress={() => onPressStop(stop)}
              onToggleLock={() => onToggleLock(stop.id)}
              onMoveUp={() => onMoveStop(stop.id, "up")}
              onMoveDown={() => onMoveStop(stop.id, "down")}
              onRemove={() => onRemoveStop(stop.id)}
            />
            {issues.length > 0 ? (
              <View style={styles.banner}>
                <IncompatibilityBanner stopName={stop.name} issues={issues} />
              </View>
            ) : null}
            {i < day.stops.length - 1 ? (
              <View style={[styles.divider, { backgroundColor: theme.colors.line }]} />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: 1, padding: 14, gap: 4 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 42 },
  banner: { marginLeft: 42, marginBottom: 8 },
});
