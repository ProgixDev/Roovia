import { Image } from "expo-image";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import type { JournalEntry } from "../../store/journalStore";

interface JournalEntryCardProps {
  entry: JournalEntry;
  onChangeCaption: (caption: string) => void;
}

export function JournalEntryCard({ entry, onChangeCaption }: JournalEntryCardProps) {
  const { theme } = useTheme();
  const [caption, setCaption] = useState(entry.caption);

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
      <Image source={entry.cover} style={[styles.cover, { backgroundColor: theme.colors.surfaceSunken }]} contentFit="cover" transition={200} />
      <View style={styles.body}>
        <Text style={[typography.cardTitle, { color: theme.colors.ink }]}>Jour {entry.dayIndex}</Text>
        <TextInput
          value={caption}
          onChangeText={setCaption}
          onBlur={() => onChangeCaption(caption)}
          placeholder="Ajouter une légende…"
          placeholderTextColor={theme.colors.inkMuted}
          multiline
          style={[typography.editorial, { color: theme.colors.ink, marginTop: 6, fontSize: 16 }]}
        />
        {entry.photos.length > 1 ? (
          <View style={styles.thumbRow}>
            {entry.photos.map((photo, i) => (
              <Image key={i} source={photo} style={[styles.thumb, { backgroundColor: theme.colors.surfaceSunken }]} contentFit="cover" />
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: 1, overflow: "hidden" },
  cover: { width: "100%", height: 160 },
  body: { padding: 16, gap: 4 },
  thumbRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  thumb: { width: 56, height: 56, borderRadius: radius.sm },
});
