import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "../../../components/ui/EmptyState";
import { ListRow } from "../../../components/ui/ListRow";
import { tabBarReservedSpace } from "../../../constants/layout";
import { radius } from "../../../constants/themes";
import { typography } from "../../../constants/typography";
import { useTheme } from "../../../contexts/ThemeContext";
import { useTravelerProfileStore } from "../../../store/travelerProfileStore";

const PARTY_LABEL: Record<string, string> = {
  solo: "Solo",
  couple: "En couple",
  family: "En famille",
  friends: "Entre amis",
};

const INTEREST_LABEL: Record<string, string> = {
  beach: "Plage",
  hiking: "Randonnée",
  sport: "Sport",
  museums: "Musées",
  food: "Gastronomie",
  nature: "Nature",
};

/**
 * The editable hub §1 hangs off — one card per wizard step, showing its
 * current value, tapping opens straight into that step rather than the
 * wizard's start. Distinct from the post-signup `setup/traveler` flow,
 * which stays the 60-second first-run version; this is the full profile.
 */
export default function TravelerProfileHubScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { profile, isSet, hydrate } = useTravelerProfileStore();

  useFocusEffect(
    useCallback(() => {
      hydrate();
    }, [hydrate]),
  );

  if (!isSet) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.ground, paddingTop: 16 }}>
        <EmptyState
          icon="person-outline"
          title="Profil voyageur"
          body="Composition, intérêts, budget, rythme de route — quelques minutes pour que l'IA planifie vraiment pour vous."
          action={{ label: "Compléter mon profil", icon: "arrow-forward", onPress: () => router.push("/profile/traveler/party" as any) }}
        />
      </View>
    );
  }

  const childrenSummary = profile.children.length > 0 ? `${profile.children.length} enfant(s)` : null;
  const interestsSummary =
    profile.interests.length > 0 ? profile.interests.map((i) => INTEREST_LABEL[i]).join(", ") : "Aucun";

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.ground }}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: tabBarReservedSpace(insets.bottom) + 24 }]}
      >
        <Text style={[typography.sectionHead, { color: theme.colors.ink }]}>Profil voyageur</Text>

        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
          <ListRow
            icon="people-outline"
            label="Qui vient"
            value={profile.party ? PARTY_LABEL[profile.party] : "—"}
            onPress={() => router.push("/profile/traveler/party" as any)}
          />
          <Divider />
          {profile.party === "family" ? (
            <>
              <ListRow
                icon="happy-outline"
                label="Enfants"
                value={childrenSummary ?? "Aucun"}
                onPress={() => router.push("/profile/traveler/children" as any)}
              />
              <Divider />
            </>
          ) : null}
          <ListRow
            icon="heart-outline"
            label="Intérêts"
            value={interestsSummary}
            onPress={() => router.push("/profile/traveler/interests" as any)}
          />
          <Divider />
          <ListRow
            icon="wallet-outline"
            label="Budget & durée"
            value={`${profile.budgetEur} € · ${profile.nights} nuits`}
            onPress={() => router.push("/profile/traveler/budget" as any)}
          />
          <Divider />
          <ListRow
            icon="location-outline"
            label="Destination & période"
            value={profile.destination || "—"}
            onPress={() => router.push("/profile/traveler/destination" as any)}
          />
          <Divider />
          <ListRow
            icon="speedometer-outline"
            label="Rythme & contraintes"
            value={`${profile.constraints.length} contrainte(s)`}
            onPress={() => router.push("/profile/traveler/preferences" as any)}
          />
        </View>

        <View style={[styles.hint, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
          <Ionicons name="sparkles-outline" size={18} color={theme.colors.lake} />
          <Text style={[typography.body, { color: theme.colors.inkMuted, flex: 1 }]}>
            Ce profil prérempli chaque nouvelle génération de voyage — modifiez-le à tout moment.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Divider() {
  const { theme } = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.line }} />;
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 16, gap: 20 },
  card: { borderRadius: radius.md, borderWidth: 1, paddingHorizontal: 14 },
  hint: { flexDirection: "row", gap: 10, alignItems: "flex-start", padding: 16, borderRadius: radius.md, borderWidth: 1 },
});
