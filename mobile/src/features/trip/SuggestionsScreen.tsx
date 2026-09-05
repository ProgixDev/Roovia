import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import { manualRecalculateSuggestion } from "../../mocks/suggestions";
import { emptyArray } from "../../lib/emptyArray";
import { useItineraryStore } from "../../store/itineraryStore";
import { useSuggestionsStore } from "../../store/suggestionsStore";
import { SuggestionCard } from "./SuggestionCard";

export default function SuggestionsScreen() {
  const { id, s: highlightId } = useLocalSearchParams<{ id: string; s?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const itinerary = useItineraryStore((s) => s.itineraries[id]);
  const applySuggestion = useItineraryStore((s) => s.applySuggestion);
  const undoLastVersion = useItineraryStore((s) => s.undoLastVersion);

  const suggestions = useSuggestionsStore((s) => s.byTrip[id] ?? emptyArray());
  const dismissedIds = useSuggestionsStore((s) => s.dismissedIds[id] ?? emptyArray());
  const appliedIds = useSuggestionsStore((s) => s.appliedIds[id] ?? emptyArray());
  const lastApplied = useSuggestionsStore((s) => s.lastApplied[id]);
  const ensureGenerated = useSuggestionsStore((s) => s.ensureGenerated);
  const addManual = useSuggestionsStore((s) => s.addManual);
  const dismiss = useSuggestionsStore((s) => s.dismiss);
  const markApplied = useSuggestionsStore((s) => s.markApplied);
  const undoLastApplied = useSuggestionsStore((s) => s.undoLastApplied);

  const activeVersion = itinerary?.versions.find((v) => v.id === itinerary.activeVersionId);

  useFocusEffect(
    useCallback(() => {
      if (activeVersion) ensureGenerated(id, activeVersion.days);
      // Suggestions only need generating once per trip — see the store's own doc.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, activeVersion?.days.length]),
  );

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(`/trip/${id}` as any);
  };

  const visible = suggestions.filter((sg) => !dismissedIds.includes(sg.id));

  const accept = (suggestionId: string) => {
    const suggestion = suggestions.find((sg) => sg.id === suggestionId);
    if (!suggestion) return;
    applySuggestion(id, suggestion);
    markApplied(id, suggestionId);
  };

  const undo = () => {
    const undone = undoLastApplied(id);
    if (undone) undoLastVersion(id);
  };

  const recalculateFrom = () => {
    if (!activeVersion || activeVersion.days.length === 0) return;
    const day = activeVersion.days[0];
    addManual(id, manualRecalculateSuggestion(day.id, day.index));
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.ground }}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.header}>
          <Pressable onPress={goBack} hitSlop={14} style={styles.headerButton}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.ink} />
          </Pressable>
        </View>

        <Text style={[typography.sectionHead, { color: theme.colors.ink }]}>Suggestions</Text>
        <Text style={[typography.body, { color: theme.colors.inkMuted, marginTop: 4 }]}>
          {"Météo, fermetures, retard de planning — l'app propose, vous décidez."}
        </Text>

        <View style={styles.toolbar}>
          <View style={{ flex: 1 }}>
            <Button label="Recalculer depuis le début" variant="secondary" icon="refresh" onPress={recalculateFrom} />
          </View>
          {lastApplied ? (
            <Pressable onPress={undo} style={styles.undoButton} hitSlop={10}>
              <Ionicons name="arrow-undo-outline" size={20} color={theme.colors.ink} />
            </Pressable>
          ) : null}
        </View>

        {visible.length === 0 ? (
          <EmptyState icon="checkmark-done-outline" title="Tout est à jour" body="Aucune suggestion pour le moment." />
        ) : (
          <View style={{ gap: 12 }}>
            {visible.map((suggestion) => (
              <View
                key={suggestion.id}
                style={suggestion.id === highlightId ? [styles.highlight, { borderColor: theme.colors.blaze }] : undefined}
              >
                <SuggestionCard
                  suggestion={suggestion}
                  applied={appliedIds.includes(suggestion.id)}
                  onAccept={() => accept(suggestion.id)}
                  onDismiss={() => dismiss(id, suggestion.id)}
                  onEdit={() => { dismiss(id, suggestion.id); goBack(); }}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 16, gap: 20 },
  header: { flexDirection: "row" },
  headerButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  toolbar: { flexDirection: "row", gap: 10, alignItems: "center" },
  undoButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  highlight: { borderWidth: 2, borderRadius: 20 },
});
