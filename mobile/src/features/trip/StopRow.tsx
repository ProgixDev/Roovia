import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import type { Stop } from "../../mocks/itineraries";
import { STOP_ICON, STOP_LABEL } from "./stopKind";

interface StopRowProps {
  stop: Stop;
  locked: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onPress: () => void;
  onToggleLock: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

export function StopRow({ stop, locked, canMoveUp, canMoveDown, onPress, onToggleLock, onMoveUp, onMoveDown, onRemove }: StopRowProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.row}>
      <Pressable onPress={onPress} style={styles.content}>
        <View style={[styles.iconWrap, { backgroundColor: theme.colors.surfaceSunken }]}>
          <Ionicons name={STOP_ICON[stop.kind]} size={16} color={theme.colors.ink} />
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Text style={[typography.button, { color: theme.colors.ink, flex: 1 }]} numberOfLines={1}>
              {stop.name}
            </Text>
            {locked ? <Ionicons name="lock-closed" size={13} color={theme.colors.blaze} /> : null}
          </View>
          <Text style={[typography.body, { color: theme.colors.inkMuted, fontSize: 13, marginTop: 2 }]} numberOfLines={2}>
            {stop.description}
          </Text>
          <View style={styles.metaRow}>
            <Text style={[typography.caption, { color: theme.colors.inkMuted }]}>{STOP_LABEL[stop.kind]}</Text>
            {stop.driveTimeMinFromPrev !== null ? (
              <Text style={[typography.mono, styles.meta, { color: theme.colors.inkMuted }]}>
                +{stop.driveTimeMinFromPrev} min
              </Text>
            ) : null}
            {stop.priceEur !== null ? (
              <Text style={[typography.mono, styles.meta, { color: theme.colors.inkMuted }]}>{stop.priceEur} €</Text>
            ) : null}
            {stop.ratingOutOf5 !== undefined ? (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={11} color={theme.colors.amber} />
                <Text style={[typography.mono, styles.meta, { color: theme.colors.inkMuted }]}>{stop.ratingOutOf5}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </Pressable>

      <View style={styles.actions}>
        <Pressable onPress={onMoveUp} disabled={!canMoveUp} hitSlop={6} style={{ opacity: canMoveUp ? 1 : 0.25 }}>
          <Ionicons name="chevron-up" size={16} color={theme.colors.inkMuted} />
        </Pressable>
        <Pressable onPress={onMoveDown} disabled={!canMoveDown} hitSlop={6} style={{ opacity: canMoveDown ? 1 : 0.25 }}>
          <Ionicons name="chevron-down" size={16} color={theme.colors.inkMuted} />
        </Pressable>
        <Pressable onPress={onToggleLock} hitSlop={6}>
          <Ionicons name={locked ? "lock-closed-outline" : "lock-open-outline"} size={16} color={theme.colors.inkMuted} />
        </Pressable>
        <Pressable onPress={onRemove} hitSlop={6}>
          <Ionicons name="trash-outline" size={16} color={theme.colors.danger} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 10, paddingVertical: 10 },
  content: { flex: 1, flexDirection: "row", gap: 10 },
  iconWrap: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaRow: { flexDirection: "row", gap: 10, marginTop: 4, alignItems: "center" },
  meta: { fontSize: 11 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  actions: { justifyContent: "space-between", alignItems: "center", paddingVertical: 2 },
});
