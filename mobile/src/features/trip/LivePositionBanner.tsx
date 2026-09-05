import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import type { Stop } from "../../mocks/itineraries";

interface LivePositionBannerProps {
  playing: boolean;
  progress: number;
  nextStop: Stop | null;
  onTogglePlay: () => void;
}

/**
 * A real position feed needs `expo-location` + background permissions, not
 * built here (see IMPLEMENTATION_PLAN.md §4) — this simulates one advancing
 * along the route so the "next stop" UX is demoable without it.
 */
export function LivePositionBanner({ playing, progress, nextStop, onTogglePlay }: LivePositionBannerProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.ink }]}>
      <Pressable onPress={onTogglePlay} style={[styles.playButton, { backgroundColor: theme.colors.blaze }]}>
        <Ionicons name={playing ? "pause" : "play"} size={18} color={theme.colors.blazeInk} />
      </Pressable>

      <View style={{ flex: 1 }}>
        {nextStop ? (
          <>
            <Text style={[typography.caption, { color: "rgba(255,255,255,0.6)" }]}>Prochain arrêt</Text>
            <Text style={[typography.button, { color: theme.colors.ground }]} numberOfLines={1}>
              {nextStop.name}
              {nextStop.driveTimeMinFromPrev ? ` · ${nextStop.driveTimeMinFromPrev} min` : ""}
            </Text>
          </>
        ) : (
          <Text style={[typography.button, { color: theme.colors.ground }]}>Arrivée à destination</Text>
        )}
        <View style={[styles.track, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
          <View style={[styles.fill, { backgroundColor: theme.colors.blaze, width: `${progress * 100}%` }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: radius.lg },
  playButton: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  track: { height: 4, borderRadius: 2, overflow: "hidden", marginTop: 8 },
  fill: { height: 4 },
});
