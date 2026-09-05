import { StyleSheet, Text, View } from "react-native";

import { fonts } from "../../constants/fonts";
import { kidsTheme } from "../../constants/kidsTheme";
import type { KidFact } from "../../mocks/kidsFacts";
import { KidIllustration } from "./KidIllustration";

export function FactCard({ fact }: { fact: KidFact }) {
  return (
    <View style={styles.card}>
      <KidIllustration category={fact.category} size={56} />
      <Text style={styles.text}>{fact.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: kidsTheme.surface,
    borderRadius: 24,
    padding: 16,
    borderWidth: 2,
    borderColor: kidsTheme.line,
  },
  text: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 15, lineHeight: 21, color: kidsTheme.ink },
});
