import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { FieldGroup } from "../../components/ui/FieldGroup";
import { TextField } from "../../components/ui/TextField";
import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuthStore } from "../../store/authStore";
import { COMMUNITY_TRIPS } from "../../mocks/community";
import type { MapPinData } from "../map/types";
import { RooviaMap } from "../map/RooviaMap";
import { useItineraryStore } from "../../store/itineraryStore";
import { useCommunityStore } from "../../store/communityStore";
import { useTripsStore } from "../../store/tripsStore";
import { VEHICLE_TYPE_LABEL } from "../vehicle/labels";
import { ReviewRow } from "./ReviewRow";
import { StarPicker } from "./StarPicker";

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const myPublished = useCommunityStore((s) => s.myPublished);
  const trip = COMMUNITY_TRIPS.find((t) => t.id === id) ?? myPublished.find((t) => t.id === id);

  const favoriteTripIds = useCommunityStore((s) => s.favoriteTripIds);
  const toggleFavorite = useCommunityStore((s) => s.toggleFavorite);
  const followedAuthorIds = useCommunityStore((s) => s.followedAuthorIds);
  const toggleFollow = useCommunityStore((s) => s.toggleFollow);
  const block = useCommunityStore((s) => s.block);
  const report = useCommunityStore((s) => s.report);
  const userReviews = useCommunityStore((s) => s.reviewsByTrip[id] ?? []);
  const addReview = useCommunityStore((s) => s.addReview);
  const addGenerated = useTripsStore((s) => s.addGenerated);
  const createFromResult = useItineraryStore((s) => s.createFromResult);
  const user = useAuthStore((s) => s.user);

  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/communaute" as any);
  };

  if (!trip) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.ground, paddingTop: 16 }}>
        <EmptyState icon="alert-circle-outline" title="Voyage introuvable" body="Ce voyage partagé n'existe plus." />
      </View>
    );
  }

  const pins: MapPinData[] = trip.itinerary.days.flatMap((day) =>
    day.stops.map((stop, i) => ({ id: stop.id, kind: "viewpoint" as const, coordinate: stop.coordinate, order: i === 0 ? day.index : undefined })),
  );
  const routeCoordinates = trip.itinerary.days.flatMap((d) => d.stops.map((s) => s.coordinate));

  const adopt = () => {
    // Same landing mechanism AI generation (§3) uses — a community trip
    // becomes a real trip + itinerary, adapted by copying its content
    // rather than needing its own separate pipeline.
    const newTripId = addGenerated({
      title: `${trip.title} (adapté)`,
      destination: trip.country,
      dateRange: `${trip.durationNights} nuits`,
      distanceKm: trip.itinerary.totalDistanceKm,
      budgetEur: trip.budgetEur,
    });
    createFromResult(newTripId, trip.itinerary);
    router.push(`/trip/${newTripId}` as any);
  };

  const reportTrip = () => {
    Alert.alert("Signaler ce voyage", "Signaler ce contenu comme inapproprié ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Signaler", style: "destructive", onPress: () => report(trip.id) },
    ]);
  };

  const blockAuthor = () => {
    Alert.alert("Bloquer cet auteur", `Vous ne verrez plus les publications de ${trip.author.name}.`, [
      { text: "Annuler", style: "cancel" },
      { text: "Bloquer", style: "destructive", onPress: () => { block(trip.author.id); goBack(); } },
    ]);
  };

  const favorite = favoriteTripIds.includes(trip.id);
  const following = followedAuthorIds.includes(trip.author.id);
  const allReviews = [...userReviews, ...trip.reviews];

  const submitReview = () => {
    if (newRating === 0) return;
    addReview(trip.id, user?.displayName || "Vous", newRating, newComment.trim());
    setNewRating(0);
    setNewComment("");
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.ground }}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.header}>
          <Pressable onPress={goBack} hitSlop={14} style={styles.headerButton}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.ink} />
          </Pressable>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable onPress={reportTrip} hitSlop={10} style={styles.headerButton}>
              <Ionicons name="flag-outline" size={20} color={theme.colors.ink} />
            </Pressable>
            <Pressable onPress={() => toggleFavorite(trip.id)} hitSlop={10} style={styles.headerButton}>
              <Ionicons name={favorite ? "heart" : "heart-outline"} size={22} color={favorite ? theme.colors.danger : theme.colors.ink} />
            </Pressable>
          </View>
        </View>

        <Image source={trip.cover} style={[styles.cover, { backgroundColor: theme.colors.surfaceSunken }]} contentFit="cover" />

        <Text style={[typography.heroStat, { color: theme.colors.ink, marginTop: 16 }]}>{trip.title}</Text>

        <Pressable onPress={() => router.push(`/community/user/${trip.author.id}` as any)} style={styles.authorRow}>
          <Text style={[typography.button, { color: theme.colors.ink }]}>Par {trip.author.name}</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.inkMuted} />
        </Pressable>

        <View style={styles.statsRow}>
          <StatTile label="Pays" value={trip.country} theme={theme} />
          <StatTile label="Durée" value={`${trip.durationNights}j`} theme={theme} />
          <StatTile label="Budget" value={`${trip.budgetEur} €`} theme={theme} />
          <StatTile label="Véhicule" value={VEHICLE_TYPE_LABEL[trip.vehicleType]} theme={theme} />
        </View>

        {routeCoordinates.length > 0 ? (
          <View style={[styles.mapPreview, { borderColor: theme.colors.line }]}>
            <RooviaMap route={{ coordinates: routeCoordinates }} pins={pins} interactive={false} style={{ flex: 1 }} />
          </View>
        ) : null}

        <View style={{ gap: 10 }}>
          <Button label="Reprendre ce voyage et l'adapter à mon profil" icon="download-outline" onPress={adopt} />
          <Button label={following ? "Suivi(e)" : "Suivre cet auteur"} variant="secondary" onPress={() => toggleFollow(trip.author.id)} />
          <Button label="Bloquer cet auteur" variant="secondary" icon="ban-outline" onPress={blockAuthor} />
        </View>

        <View style={{ gap: 10 }}>
          <Text style={[typography.cardTitle, { color: theme.colors.ink }]}>Avis</Text>
          {allReviews.map((review) => (
            <ReviewRow key={review.id} review={review} />
          ))}

          <FieldGroup label="Laisser un avis">
            <View style={{ gap: 12 }}>
              <StarPicker value={newRating} onChange={setNewRating} />
              <TextField label="Commentaire" value={newComment} onChangeText={setNewComment} placeholder="Votre expérience sur cet itinéraire…" multiline style={{ minHeight: 70 }} />
              <Button label="Publier l'avis" variant="secondary" onPress={submitReview} disabled={newRating === 0} />
            </View>
          </FieldGroup>
        </View>
      </ScrollView>
    </View>
  );
}

function StatTile({ label, value, theme }: { label: string; value: string; theme: ReturnType<typeof useTheme>["theme"] }) {
  return (
    <View style={[styles.statTile, { backgroundColor: theme.colors.surfaceSunken }]}>
      <Text style={[typography.caption, { color: theme.colors.inkMuted }]}>{label}</Text>
      <Text style={[typography.mono, { color: theme.colors.ink, marginTop: 4 }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 16, gap: 20 },
  header: { flexDirection: "row", justifyContent: "space-between" },
  headerButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  cover: { width: "100%", height: 180, borderRadius: radius.lg },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statTile: { flexBasis: "47%", flexGrow: 1, borderRadius: radius.md, padding: 12 },
  mapPreview: { height: 160, borderRadius: radius.lg, borderWidth: 1, overflow: "hidden" },
});
