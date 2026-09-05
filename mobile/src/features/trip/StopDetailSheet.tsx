import { Ionicons } from "@expo/vector-icons";
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import type { Stop } from "../../mocks/itineraries";
import { STOP_ICON, STOP_LABEL } from "./stopKind";

const RATIONALE: Record<Stop["kind"], string> = {
  visit: "Sélectionné pour son intérêt culturel et sa proximité avec votre itinéraire.",
  activity: "Une pause active adaptée au rythme choisi dans votre profil voyageur.",
  sleep_free: "Un spot toléré, cohérent avec votre préférence pour les étapes gratuites.",
  sleep_paid: "Des services complets pour recharger l'eau et vidanger avant l'étape suivante.",
  service: "Le point de ravitaillement le plus pratique sur cette portion de route.",
};

interface StopDetailSheetProps {
  stop: Stop | null;
  favorite: boolean;
  onClose: () => void;
  onToggleFavorite: () => void;
  onRemove: () => void;
}

export function StopDetailSheet({ stop, favorite, onClose, onToggleFavorite, onRemove }: StopDetailSheetProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const openInMaps = () => {
    if (!stop) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${stop.coordinate.latitude},${stop.coordinate.longitude}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <Modal visible={stop !== null} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fermer" />
      {stop ? (
        <View
          style={[styles.sheet, { backgroundColor: theme.colors.surfaceRaised, paddingBottom: insets.bottom + 20 }]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={[styles.hero, { backgroundColor: theme.colors.surfaceSunken }]}>
              <Ionicons name={STOP_ICON[stop.kind]} size={40} color={theme.colors.inkMuted} />
            </View>

            <View style={styles.body}>
              <View style={styles.titleRow}>
                <Text style={[typography.sectionHead, { color: theme.colors.ink, fontSize: 24, flex: 1 }]}>
                  {stop.name}
                </Text>
                <Pressable onPress={onToggleFavorite} hitSlop={10}>
                  <Ionicons
                    name={favorite ? "heart" : "heart-outline"}
                    size={24}
                    color={favorite ? theme.colors.danger : theme.colors.inkMuted}
                  />
                </Pressable>
              </View>

              <Text style={[typography.caption, { color: theme.colors.inkMuted, marginTop: 6 }]}>
                {STOP_LABEL[stop.kind]}
              </Text>

              <Text style={[typography.body, { color: theme.colors.ink, marginTop: 14 }]}>{stop.description}</Text>

              <View style={styles.metaGrid}>
                {stop.hours ? (
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={16} color={theme.colors.inkMuted} />
                    <Text style={[typography.body, { color: theme.colors.inkMuted }]}>{stop.hours}</Text>
                  </View>
                ) : null}
                {stop.priceEur !== null ? (
                  <View style={styles.metaItem}>
                    <Ionicons name="cash-outline" size={16} color={theme.colors.inkMuted} />
                    <Text style={[typography.body, { color: theme.colors.inkMuted }]}>{stop.priceEur} €</Text>
                  </View>
                ) : null}
                {stop.ratingOutOf5 !== undefined ? (
                  <View style={styles.metaItem}>
                    <Ionicons name="star" size={16} color={theme.colors.amber} />
                    <Text style={[typography.body, { color: theme.colors.inkMuted }]}>{stop.ratingOutOf5} / 5</Text>
                  </View>
                ) : null}
                {stop.detourMinutes ? (
                  <View style={styles.metaItem}>
                    <Ionicons name="git-branch-outline" size={16} color={theme.colors.inkMuted} />
                    <Text style={[typography.body, { color: theme.colors.inkMuted }]}>+{stop.detourMinutes} min de détour</Text>
                  </View>
                ) : null}
              </View>

              <View style={[styles.rationale, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
                <Ionicons name="sparkles-outline" size={16} color={theme.colors.lake} />
                <Text style={[typography.body, { color: theme.colors.inkMuted, flex: 1, fontSize: 13 }]}>
                  {RATIONALE[stop.kind]}
                </Text>
              </View>

              <View style={styles.actions}>
                <Pressable onPress={openInMaps} style={[styles.actionButton, { backgroundColor: theme.colors.blaze }]}>
                  <Ionicons name="navigate" size={18} color={theme.colors.blazeInk} />
                  <Text style={[typography.button, { color: theme.colors.blazeInk }]}>Ouvrir dans Maps</Text>
                </Pressable>
                <Pressable
                  onPress={() => { onRemove(); onClose(); }}
                  style={[styles.actionButton, { borderWidth: 1, borderColor: theme.colors.danger }]}
                >
                  <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
                  <Text style={[typography.button, { color: theme.colors.danger }]}>{"Retirer de l'étape"}</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: "80%",
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: "hidden",
  },
  hero: { height: 140, alignItems: "center", justifyContent: "center" },
  body: { padding: 20, gap: 4 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  metaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16, marginTop: 16 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  rationale: { flexDirection: "row", gap: 10, alignItems: "flex-start", padding: 14, borderRadius: radius.md, borderWidth: 1, marginTop: 18 },
  actions: { gap: 10, marginTop: 20 },
  actionButton: { flexDirection: "row", gap: 8, height: 50, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
});
