import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import { searchPlaces } from "../../mocks/places";

interface DestinationSearchFieldProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * A distinct destination picker from `DestinationAutocomplete` (which
 * `features/generate/GuidedScreen.tsx` also uses, so it's left alone) — a
 * plain search bar with the result rendered as a tinted, checkmarked
 * summary card once chosen, matching the traveler-wizard "Where" mockup.
 * Free typing still works: whatever's in `value` renders as the summary
 * once the field blurs, whether it came from the dropdown or was typed by
 * hand — `searchPlaces` isn't the only valid way to name a destination.
 */
export function DestinationSearchField({ value, onChange }: DestinationSearchFieldProps) {
  const { theme } = useTheme();
  const [query, setQuery] = useState(value);
  const [focused, setFocused] = useState(false);
  const results = useMemo(() => searchPlaces(query), [query]);
  const showResults = focused && query.length > 0 && results.length > 0;
  const showSummary = !focused && value.length > 0;

  const select = (name: string, country: string) => {
    const full = `${name}, ${country}`;
    setQuery(full);
    onChange(full);
    setFocused(false);
  };

  const [name, subtitle] = value.includes(", ") ? value.split(/, (.+)/) : [value, null];

  return (
    <View>
      {showSummary ? (
        <Pressable
          onPress={() => setFocused(true)}
          style={[styles.summary, { backgroundColor: theme.colors.surfaceSunken, borderColor: theme.colors.line }]}
        >
          <View style={[styles.summaryIcon, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="map" size={48} color={theme.colors.ink} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[typography.cardTitle, { color: theme.colors.ink, fontSize: 22, lineHeight: 26 }]}>{name}</Text>
            {subtitle ? (
              <Text style={[typography.body, { color: theme.colors.inkMuted }]}>{subtitle}</Text>
            ) : null}
          </View>
          <View style={[styles.check, { backgroundColor: theme.colors.blaze }]}>
            <Ionicons name="checkmark" size={16} color={theme.colors.blazeInk} />
          </View>
        </Pressable>
      ) : (
        <View style={[styles.searchBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
          <Ionicons name="search-outline" size={18} color={theme.colors.inkMuted} />
          <TextInput
            style={[typography.body, { color: theme.colors.ink, flex: 1 }]}
            placeholder="Rechercher une destination"
            placeholderTextColor={theme.colors.inkMuted}
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              onChange(text);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
          />
        </View>
      )}

      {showResults ? (
        <View style={[styles.results, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
          {results.map((place) => (
            <Pressable key={place.id} onPress={() => select(place.name, place.country)} style={styles.row}>
              <Ionicons name="location-outline" size={16} color={theme.colors.lake} />
              <Text style={[typography.body, { color: theme.colors.ink }]}>{place.name}</Text>
              <Text style={[typography.body, { color: theme.colors.inkMuted }]}>{place.country}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 54,
    paddingHorizontal: 16,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  results: { marginTop: 8, borderRadius: radius.md, borderWidth: 1, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 12 },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  summaryIcon: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  check: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
});
