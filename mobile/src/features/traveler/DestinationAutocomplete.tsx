import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { TextField } from "../../components/ui/TextField";
import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import { searchPlaces } from "../../mocks/places";

interface DestinationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
}

export function DestinationAutocomplete({ value, onChange }: DestinationAutocompleteProps) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);
  const results = useMemo(() => searchPlaces(value), [value]);
  const showResults = focused && results.length > 0;

  return (
    <View>
      <TextField
        label="Destination"
        placeholder="Pays, région ou ville"
        value={value}
        onChangeText={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
      />
      {showResults ? (
        <View style={[styles.results, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
          {results.map((place) => (
            <Pressable
              key={place.id}
              onPress={() => {
                onChange(`${place.name}, ${place.country}`);
                setFocused(false);
              }}
              style={styles.row}
            >
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
  results: {
    marginTop: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 12 },
});
