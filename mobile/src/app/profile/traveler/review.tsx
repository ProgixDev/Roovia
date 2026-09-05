import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "../../../components/ui/Button";
import { ListRow } from "../../../components/ui/ListRow";
import { radius } from "../../../constants/themes";
import { typography } from "../../../constants/typography";
import { useTheme } from "../../../contexts/ThemeContext";
import { PARTY_LABEL, paceLabel } from "../../../features/traveler/labels";
import { useTravelerProfileStore } from "../../../store/travelerProfileStore";

/** Phase 4/4 — the wizard's finish line, not a form step: a summary + two exits (back to edit, or on to generation). */
export default function TravelerReviewStep() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { profile, markComplete } = useTravelerProfileStore();

  const editProfile = () => router.push("/profile/traveler/who" as any);

  const finish = async () => {
    await markComplete();
    router.replace("/(tabs)" as any);
  };

  const partySummary =
    profile.party === "family"
      ? `${PARTY_LABEL.family} · ${profile.children.length} enfant${profile.children.length > 1 ? "s" : ""}`
      : profile.party
        ? PARTY_LABEL[profile.party]
        : "Composition à définir";

  const whereSummary = `${profile.destination || "Destination à définir"} · ${profile.nights} nuits`;

  const h = Math.floor(profile.maxDrivingHoursPerDay);
  const m = Math.round((profile.maxDrivingHoursPerDay - h) * 60);
  const styleSummary = `${paceLabel(profile.pace)} · ${h} h ${m > 0 ? m : "00"}`;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.ground }}>
      <View style={[styles.content, { paddingTop: 24, paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.dots}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.dot, { backgroundColor: theme.colors.blaze }]} />
          ))}
        </View>
        <Text style={[typography.body, { color: theme.colors.inkMuted, textAlign: "center", marginTop: 8 }]}>
          Profil voyageur
        </Text>

        <Text style={[typography.sectionHead, { color: theme.colors.ink, textAlign: "center", marginTop: 24 }]}>
          C&apos;est prêt !
        </Text>
        <Text style={[typography.body, { color: theme.colors.inkMuted, textAlign: "center", marginTop: 8 }]}>
          Roovia sait maintenant comment vous aimez voyager.
        </Text>

        <Image
          source={require("../../../../assets/images/trips/roovia-trip-alpine-weekend.png")}
          style={[styles.hero, { backgroundColor: theme.colors.surfaceSunken }]}
          contentFit="cover"
        />

        <View style={[styles.summary, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
          <ListRow icon="people-outline" label={partySummary} showChevron={false} />
          <Divider />
          <ListRow icon="location-outline" label={whereSummary} showChevron={false} />
          <Divider />
          <ListRow icon="time-outline" label={styleSummary} showChevron={false} />
        </View>

        <Button label="Modifier mon profil" variant="secondary" icon="pencil-outline" onPress={editProfile} />
        <Button label="Générer mon premier voyage" trailingIcon="arrow-forward" onPress={finish} />

        <Text style={[typography.body, { color: theme.colors.inkMuted, textAlign: "center" }]}>
          Vous pourrez modifier vos préférences plus tard.
        </Text>
      </View>
    </View>
  );
}

function Divider() {
  const { theme } = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.line }} />;
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 24, gap: 16 },
  dots: { flexDirection: "row", gap: 8, alignSelf: "center" },
  dot: { width: 8, height: 8, borderRadius: 4 },
  hero: {
    height: 280,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginTop: 8,
  },
  summary: { borderRadius: radius.md, borderWidth: 1, paddingHorizontal: 14 },
});
