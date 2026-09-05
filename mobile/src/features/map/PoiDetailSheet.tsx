import { Ionicons } from "@expo/vector-icons";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { mapPins, radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import { formatDate } from "../../lib/format";
import type { Poi } from "../../mocks/pois";
import { usePoiStore } from "../../store/poiStore";
import { CATEGORY_BY_KIND, ICON_BY_KIND, POI_KIND_LABEL } from "./types";

interface PoiDetailSheetProps {
  poi: Poi | null;
  onClose: () => void;
  onAddToTrip: () => void;
}

export function PoiDetailSheet({ poi, onClose, onAddToTrip }: PoiDetailSheetProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const favoriteIds = usePoiStore((s) => s.favoriteIds);
  const toggleFavorite = usePoiStore((s) => s.toggleFavorite);
  const reportedIds = usePoiStore((s) => s.reportedIds);
  const report = usePoiStore((s) => s.report);

  const reportPoi = () => {
    if (!poi) return;
    Alert.alert("Signaler ce lieu", "Indiquer que ce lieu est erroné ou fermé ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Signaler", style: "destructive", onPress: () => report(poi.id) },
    ]);
  };

  return (
    <Modal visible={poi !== null} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fermer" />
      {poi ? (
        <View style={[styles.sheet, { backgroundColor: theme.colors.surfaceRaised, paddingBottom: insets.bottom + 20 }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={[styles.hero, { backgroundColor: mapPins[CATEGORY_BY_KIND[poi.kind]] }]}>
              {ICON_BY_KIND[poi.kind] ? (
                <Ionicons name={ICON_BY_KIND[poi.kind]!} size={40} color="#FFFFFF" />
              ) : (
                <Text style={[typography.sectionHead, { color: "#FFFFFF" }]}>WC</Text>
              )}
            </View>

            <View style={styles.body}>
              <View style={styles.titleRow}>
                <Text style={[typography.sectionHead, { color: theme.colors.ink, fontSize: 22, flex: 1 }]}>{poi.name}</Text>
                <Pressable onPress={() => toggleFavorite(poi.id)} hitSlop={10}>
                  <Ionicons
                    name={favoriteIds.includes(poi.id) ? "heart" : "heart-outline"}
                    size={24}
                    color={favoriteIds.includes(poi.id) ? theme.colors.danger : theme.colors.inkMuted}
                  />
                </Pressable>
              </View>
              <Text style={[typography.caption, { color: theme.colors.inkMuted, marginTop: 6 }]}>{POI_KIND_LABEL[poi.kind]}</Text>
              <Text style={[typography.body, { color: theme.colors.ink, marginTop: 14 }]}>{poi.description}</Text>

              <View style={styles.metaGrid}>
                <View style={styles.metaItem}>
                  <Ionicons name="star" size={16} color={theme.colors.amber} />
                  <Text style={[typography.body, { color: theme.colors.inkMuted }]}>{poi.ratingOutOf5} / 5</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name={poi.openNow ? "checkmark-circle-outline" : "close-circle-outline"} size={16} color={poi.openNow ? theme.colors.moss : theme.colors.danger} />
                  <Text style={[typography.body, { color: theme.colors.inkMuted }]}>{poi.openNow ? "Ouvert" : "Fermé"}</Text>
                </View>
                {poi.priceEur !== null ? (
                  <View style={styles.metaItem}>
                    <Ionicons name="cash-outline" size={16} color={theme.colors.inkMuted} />
                    <Text style={[typography.body, { color: theme.colors.inkMuted }]}>
                      {poi.kind === "fuel" ? `${poi.priceEur} €/L` : `${poi.priceEur} €`}
                    </Text>
                  </View>
                ) : null}
                <View style={styles.metaItem}>
                  <Ionicons name="shield-checkmark-outline" size={16} color={theme.colors.inkMuted} />
                  <Text style={[typography.body, { color: theme.colors.inkMuted }]}>
                    Vérifié le {formatDate(new Date(poi.lastVerified))}
                  </Text>
                </View>
              </View>

              {reportedIds.includes(poi.id) ? (
                <View style={[styles.reportedBanner, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
                  <Ionicons name="flag" size={14} color={theme.colors.inkMuted} />
                  <Text style={[typography.caption, { color: theme.colors.inkMuted }]}>Signalé, merci</Text>
                </View>
              ) : null}

              <View style={styles.actions}>
                <Pressable onPress={onAddToTrip} style={[styles.actionButton, { backgroundColor: theme.colors.blaze }]}>
                  <Ionicons name="add" size={18} color={theme.colors.blazeInk} />
                  <Text style={[typography.button, { color: theme.colors.blazeInk }]}>Ajouter au voyage</Text>
                </Pressable>
                <Pressable onPress={reportPoi} style={[styles.actionButton, { borderWidth: 1, borderColor: theme.colors.line }]}>
                  <Ionicons name="flag-outline" size={18} color={theme.colors.ink} />
                  <Text style={[typography.button, { color: theme.colors.ink }]}>Signaler</Text>
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
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, maxHeight: "80%", borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, overflow: "hidden" },
  hero: { height: 140, alignItems: "center", justifyContent: "center" },
  body: { padding: 20, gap: 4 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  metaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16, marginTop: 16 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  reportedBanner: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: radius.md, borderWidth: 1, marginTop: 16, alignSelf: "flex-start" },
  actions: { gap: 10, marginTop: 20 },
  actionButton: { flexDirection: "row", gap: 8, height: 50, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
});
