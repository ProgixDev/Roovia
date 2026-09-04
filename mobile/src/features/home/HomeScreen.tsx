import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Alert, Pressable, SectionList, Share, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ActionSheet, type ActionSheetAction } from "../../components/ui/ActionSheet";
import { Button } from "../../components/ui/Button";
import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import { type Trip, type TripStatus, useTripsStore } from "../../store/tripsStore";
import { TripCard } from "./TripCard";

interface Section {
  title: string;
  status: TripStatus;
  data: Trip[];
}

// Most-relevant-first, not alphabetical or creation order: what's happening
// right now matters more than a draft that isn't going anywhere yet.
const SECTION_ORDER: { status: TripStatus; title: string }[] = [
  { status: "in_progress", title: "En cours" },
  { status: "upcoming", title: "À venir" },
  { status: "draft", title: "Brouillons" },
  { status: "past", title: "Terminés" },
];

function notReady() {
  Alert.alert("Bientôt disponible", "La génération de voyage par IA arrive bientôt.");
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const trips = useTripsStore((s) => s.trips);
  const refreshing = useTripsStore((s) => s.refreshing);
  const refresh = useTripsStore((s) => s.refresh);
  const duplicate = useTripsStore((s) => s.duplicate);
  const archive = useTripsStore((s) => s.archive);
  const remove = useTripsStore((s) => s.remove);

  const [menuTripId, setMenuTripId] = useState<string | null>(null);

  const sections: Section[] = useMemo(() => {
    const visible = trips.filter((t) => !t.archived);
    return SECTION_ORDER.map(({ status, title }) => ({
      title,
      status,
      data: visible.filter((t) => t.status === status),
    })).filter((section) => section.data.length > 0);
  }, [trips]);

  const menuTrip = trips.find((t) => t.id === menuTripId) ?? null;

  const shareTrip = async (trip: Trip) => {
    try {
      await Share.share({
        message: `${trip.title} — ${trip.destination}${trip.dateRange ? ` (${trip.dateRange})` : ""}, sur Roovia.`,
      });
    } catch {
      // The share sheet can be dismissed or fail silently on some
      // platforms — nothing to recover, there's no state change to undo.
    }
  };

  const confirmDelete = (trip: Trip) => {
    Alert.alert("Supprimer ce voyage ?", `« ${trip.title} » sera définitivement supprimé.`, [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: () => remove(trip.id) },
    ]);
  };

  const actionsFor = (trip: Trip): ActionSheetAction[] => [
    { key: "duplicate", label: "Dupliquer", icon: "copy-outline", onPress: () => duplicate(trip.id) },
    { key: "archive", label: "Archiver", icon: "archive-outline", onPress: () => archive(trip.id) },
    { key: "share", label: "Partager", icon: "share-outline", onPress: () => shareTrip(trip) },
    {
      key: "delete",
      label: "Supprimer",
      icon: "trash-outline",
      destructive: true,
      onPress: () => confirmDelete(trip),
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.ground }}>
      <SectionList
        sections={sections}
        keyExtractor={(trip) => trip.id}
        stickySectionHeadersEnabled={false}
        refreshing={refreshing}
        onRefresh={refresh}
        contentContainerStyle={[
          styles.list,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
        ]}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[typography.sectionHead, { color: theme.colors.ink }]}>Mes voyages</Text>
            <Pressable
              onPress={notReady}
              hitSlop={10}
              style={[styles.addButton, { backgroundColor: theme.colors.blaze }]}
              accessibilityLabel="Nouveau voyage"
            >
              <Ionicons name="add" size={22} color={theme.colors.blazeInk} />
            </Pressable>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <Text style={[typography.caption, styles.sectionHeader, { color: theme.colors.inkMuted }]}>
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <TripCard trip={item} onPressMore={() => setMenuTripId(item.id)} />
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        SectionSeparatorComponent={() => <View style={{ height: 28 }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="map-outline" size={40} color={theme.colors.inkMuted} />
            <Text style={[typography.cardTitle, { color: theme.colors.ink, marginTop: 16 }]}>
              {"Aucun voyage pour l'instant"}
            </Text>
            <Text
              style={[
                typography.body,
                { color: theme.colors.inkMuted, textAlign: "center", marginTop: 6 },
              ]}
            >
              {"Décrivez le voyage dont vous rêvez, l'IA s'occupe du reste."}
            </Text>
            <View style={{ marginTop: 24, alignSelf: "stretch" }}>
              <Button label="Générer mon premier voyage" onPress={notReady} />
            </View>
          </View>
        }
      />

      <ActionSheet
        visible={menuTrip !== null}
        onClose={() => setMenuTripId(null)}
        title={menuTrip?.title}
        actions={menuTrip ? actionsFor(menuTrip) : []}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 20, flexGrow: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: { marginBottom: 12 },
  cardWrap: {},
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
});
