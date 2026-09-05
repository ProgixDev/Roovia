import { StyleSheet, Text, View } from "react-native";

import { fonts } from "../../constants/fonts";
import { kidsTheme } from "../../constants/kidsTheme";
import type { Stop } from "../../mocks/itineraries";
import { KidIllustration } from "./KidIllustration";

const KIND_CATEGORY: Record<Stop["kind"], "animal" | "plante" | "monument"> = {
  visit: "monument",
  activity: "plante",
  sleep_free: "plante",
  sleep_paid: "monument",
  service: "animal",
};

export function UpcomingStopCard({ stop }: { stop: Stop }) {
  return (
    <View style={styles.card}>
      <KidIllustration category={KIND_CATEGORY[stop.kind]} size={72} />
      <Text style={styles.title} numberOfLines={2}>{stop.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    alignItems: "center",
    backgroundColor: kidsTheme.surface,
    borderRadius: 24,
    padding: 16,
    borderWidth: 2,
    borderColor: kidsTheme.line,
    gap: 10,
  },
  title: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: kidsTheme.ink, textAlign: "center" },
});
