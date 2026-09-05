import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import { COMMUNITY_TRIPS } from "../../mocks/community";
import { useCommunityStore } from "../../store/communityStore";
import { CommunityCard } from "./CommunityCard";

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const myPublished = useCommunityStore((s) => s.myPublished);
  const followedAuthorIds = useCommunityStore((s) => s.followedAuthorIds);
  const toggleFollow = useCommunityStore((s) => s.toggleFollow);

  // Self-published trips (author.id "me", see TripDetailScreen's publish
  // call) live only in myPublished, not the static community seed set.
  const trips = [...COMMUNITY_TRIPS, ...myPublished].filter((t) => t.author.id === id);
  const author = trips[0]?.author;

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/communaute" as any);
  };

  if (!author) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.ground, paddingTop: 16 }}>
        <EmptyState icon="person-outline" title="Profil introuvable" body="Ce voyageur n'existe plus." />
      </View>
    );
  }

  const following = followedAuthorIds.includes(author.id);
  const initials = author.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.ground }}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}>
        <Pressable onPress={goBack} hitSlop={14} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.ink} />
        </Pressable>

        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.blaze }]}>
            <Text style={[typography.sectionHead, { color: theme.colors.blazeInk, fontSize: 22 }]}>{initials}</Text>
          </View>
          <Text style={[typography.heroStat, { color: theme.colors.ink, marginTop: 12 }]}>{author.name}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statTile, { backgroundColor: theme.colors.surfaceSunken }]}>
            <Text style={[typography.heroStat, { color: theme.colors.ink, fontSize: 28 }]}>{trips.length}</Text>
            <Text style={[typography.caption, { color: theme.colors.inkMuted }]}>Voyages publiés</Text>
          </View>
          <View style={[styles.statTile, { backgroundColor: theme.colors.surfaceSunken }]}>
            <Text style={[typography.heroStat, { color: theme.colors.ink, fontSize: 28 }]}>{author.spotsContributed}</Text>
            <Text style={[typography.caption, { color: theme.colors.inkMuted }]}>Spots contribués</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {author.badges.map((badge) => (
            <View key={badge} style={[styles.badge, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
              <Ionicons name="ribbon-outline" size={14} color={theme.colors.amber} />
              <Text style={[typography.caption, { color: theme.colors.ink, textTransform: "none", letterSpacing: 0 }]}>{badge}</Text>
            </View>
          ))}
        </View>

        <Button label={following ? "Suivi(e)" : "Suivre"} variant={following ? "secondary" : "primary"} onPress={() => toggleFollow(author.id)} />

        <View style={{ gap: 14 }}>
          <Text style={[typography.cardTitle, { color: theme.colors.ink }]}>Voyages publiés</Text>
          {trips.map((trip) => (
            <CommunityCard key={trip.id} trip={trip} onPress={() => router.push(`/community/${trip.id}` as any)} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 16, gap: 20 },
  headerButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  profileHeader: { alignItems: "center" },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  statsRow: { flexDirection: "row", gap: 10 },
  statTile: { flex: 1, borderRadius: radius.md, padding: 14, alignItems: "center" },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, height: 30, paddingHorizontal: 12, borderRadius: radius.pill, borderWidth: 1 },
});
