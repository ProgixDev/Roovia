import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import type { CommunityReview } from "../../mocks/community";

export function ReviewRow({ review }: { review: CommunityReview }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
      <View style={styles.headerRow}>
        <Text style={[typography.button, { color: theme.colors.ink }]}>{review.authorName}</Text>
        <View style={styles.stars}>
          {Array.from({ length: 5 }, (_, i) => (
            <Ionicons key={i} name={i < review.ratingOutOf5 ? "star" : "star-outline"} size={13} color={theme.colors.amber} />
          ))}
        </View>
      </View>
      <Text style={[typography.body, { color: theme.colors.inkMuted, marginTop: 6, fontSize: 13 }]}>{review.comment}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.md, borderWidth: 1, padding: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  stars: { flexDirection: "row", gap: 2 },
});
