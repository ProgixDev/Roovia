import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";

import { Button } from "../../components/ui/Button";
import { Chip } from "../../components/ui/Chip";
import { EmptyState } from "../../components/ui/EmptyState";
import { FieldGroup } from "../../components/ui/FieldGroup";
import { TextField } from "../../components/ui/TextField";
import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import { interpolateAlongRoute } from "../map/useMapRegion";
import { RooviaMap } from "../map/RooviaMap";
import type { LatLng, MemberMarker } from "../map/types";
import type { Stop } from "../../mocks/itineraries";
import { useGroupStore, type MemberRole } from "../../store/groupStore";
import { ConflictBanner } from "./ConflictBanner";
import { MemberRow } from "./MemberRow";

interface GroupSegmentProps {
  tripId: string;
  tripTitle: string;
  meName: string;
  routeCoordinates: LatLng[];
  allStops: Stop[];
  onApproveProposal: (stopName: string, description: string) => void;
}

/** Member positions are fixed phase-offsets along the route, not truly live — no second real device to track in this prototype. */
const DEMO_PHASES = [0.35, 0.62];

export function GroupSegment({ tripId, tripTitle, meName, routeCoordinates, allStops, onApproveProposal }: GroupSegmentProps) {
  const { theme } = useTheme();
  const members = useGroupStore((s) => s.membersByTrip[tripId] ?? []);
  const convoy = useGroupStore((s) => s.convoyByTrip[tripId] ?? []);
  const proposals = useGroupStore((s) => s.proposalsByTrip[tripId] ?? []);
  const comments = useGroupStore((s) => s.commentsByTrip[tripId] ?? []);
  const conflict = useGroupStore((s) => s.conflictByTrip[tripId] ?? false);
  const ensureOwner = useGroupStore((s) => s.ensureOwner);
  const addMember = useGroupStore((s) => s.addMember);
  const updateRole = useGroupStore((s) => s.updateRole);
  const removeMember = useGroupStore((s) => s.removeMember);
  const addConvoyVehicle = useGroupStore((s) => s.addConvoyVehicle);
  const removeConvoyVehicle = useGroupStore((s) => s.removeConvoyVehicle);
  const proposeStop = useGroupStore((s) => s.proposeStop);
  const respondToProposal = useGroupStore((s) => s.respondToProposal);
  const addComment = useGroupStore((s) => s.addComment);
  const triggerConflict = useGroupStore((s) => s.triggerSimulatedConflict);
  const resolveConflict = useGroupStore((s) => s.resolveConflict);

  const [newMemberName, setNewMemberName] = useState("");
  const [newVehicleLabel, setNewVehicleLabel] = useState("");
  const [proposalName, setProposalName] = useState("");
  const [proposalDescription, setProposalDescription] = useState("");
  const [selectedStopId, setSelectedStopId] = useState<string | null>(allStops[0]?.id ?? null);
  const [commentText, setCommentText] = useState("");

  if (members.length === 0) ensureOwner(tripId, meName);
  const isOwner = members.find((m) => m.id === "me")?.role === "owner";

  const memberMarkers: MemberMarker[] = members
    .filter((m) => m.id !== "me")
    .map((member, i) => {
      const coordinate = interpolateAlongRoute(routeCoordinates, DEMO_PHASES[i % DEMO_PHASES.length]);
      return coordinate ? { id: member.id, coordinate, initials: member.name.slice(0, 2).toUpperCase() } : null;
    })
    .filter((m): m is MemberMarker => m !== null);

  const invite = () => {
    const code = tripId.slice(-6).toUpperCase();
    Share.share({ message: `Rejoins le convoi « ${tripTitle} » sur Roovia — code : ${code}\nhttps://roovia.app/join/${code}` }).catch(() => {});
  };

  const selectedStop = allStops.find((s) => s.id === selectedStopId) ?? null;
  const stopComments = comments.filter((c) => c.stopId === selectedStopId);

  return (
    <View style={{ gap: 20 }}>
      {conflict ? <ConflictBanner onResolve={() => resolveConflict(tripId)} /> : null}

      {memberMarkers.length > 0 ? (
        <View style={[styles.mapPreview, { borderColor: theme.colors.line }]}>
          <RooviaMap route={{ coordinates: routeCoordinates }} memberMarkers={memberMarkers} interactive={false} style={{ flex: 1 }} />
        </View>
      ) : null}

      <View style={styles.headerRow}>
        <FieldGroup label="Membres">
          <View style={{ gap: 4 }}>
            {members.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                canEdit={isOwner}
                onChangeRole={(role: MemberRole) => updateRole(tripId, member.id, role)}
                onRemove={() => removeMember(tripId, member.id)}
              />
            ))}
          </View>
        </FieldGroup>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 2 }}>
          <TextField label="Ajouter un membre" value={newMemberName} onChangeText={setNewMemberName} placeholder="Prénom" />
        </View>
        <View style={{ justifyContent: "flex-end" }}>
          <Button
            label="Inviter"
            variant="secondary"
            onPress={() => { if (newMemberName.trim()) { addMember(tripId, newMemberName.trim(), "editor"); setNewMemberName(""); } }}
          />
        </View>
      </View>
      <Button label="Partager le lien d'invitation" variant="secondary" icon="share-outline" onPress={invite} />

      <FieldGroup label="Véhicules du convoi">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {convoy.map((v) => (
            <Chip key={v.id} label={v.label} onPress={() => removeConvoyVehicle(tripId, v.id)} />
          ))}
        </View>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
          <View style={{ flex: 2 }}>
            <TextField label="Véhicule" value={newVehicleLabel} onChangeText={setNewVehicleLabel} placeholder="Ex : Van de Marc" />
          </View>
          <View style={{ justifyContent: "flex-end" }}>
            <Button
              label="Ajouter"
              variant="secondary"
              onPress={() => { if (newVehicleLabel.trim()) { addConvoyVehicle(tripId, newVehicleLabel.trim()); setNewVehicleLabel(""); } }}
            />
          </View>
        </View>
      </FieldGroup>

      <FieldGroup label="Proposer un arrêt">
        <TextField label="Nom du lieu" value={proposalName} onChangeText={setProposalName} placeholder="Aire de baignade, restaurant…" />
        <TextField label="Description" value={proposalDescription} onChangeText={setProposalDescription} placeholder="Pourquoi cet arrêt ?" style={{ marginTop: 10 }} />
        <View style={{ marginTop: 10 }}>
          <Button
            label="Proposer au groupe"
            variant="secondary"
            icon="add"
            onPress={() => {
              if (proposalName.trim()) {
                proposeStop(tripId, meName, proposalName.trim(), proposalDescription.trim());
                setProposalName("");
                setProposalDescription("");
              }
            }}
          />
        </View>
      </FieldGroup>

      {proposals.length > 0 ? (
        <FieldGroup label="Propositions">
          <View style={{ gap: 8 }}>
            {proposals.map((proposal) => (
              <View key={proposal.id} style={[styles.proposalCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
                <Text style={[typography.button, { color: theme.colors.ink }]}>{proposal.stopName}</Text>
                <Text style={[typography.body, { color: theme.colors.inkMuted, fontSize: 12, marginTop: 2 }]}>
                  Proposé par {proposal.proposedBy}
                </Text>
                {proposal.status === "pending" ? (
                  <View style={styles.proposalActions}>
                    <Button
                      label="Approuver"
                      onPress={() => { respondToProposal(tripId, proposal.id, true); onApproveProposal(proposal.stopName, proposal.description); }}
                    />
                    <Button label="Refuser" variant="secondary" onPress={() => respondToProposal(tripId, proposal.id, false)} />
                  </View>
                ) : (
                  <Text style={[typography.caption, { color: proposal.status === "approved" ? theme.colors.moss : theme.colors.danger, marginTop: 6 }]}>
                    {proposal.status === "approved" ? "Approuvé — ajouté à l'itinéraire" : "Refusé"}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </FieldGroup>
      ) : null}

      <FieldGroup label="Commentaires par étape">
        {allStops.length === 0 ? (
          <EmptyState icon="chatbox-outline" title="Aucun arrêt" body="Ajoutez un itinéraire pour commenter ses étapes." />
        ) : (
          <>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {allStops.map((stop) => (
                <Chip key={stop.id} label={stop.name} selected={selectedStopId === stop.id} onPress={() => setSelectedStopId(stop.id)} />
              ))}
            </View>
            {selectedStop ? (
              <View style={{ gap: 8, marginTop: 10 }}>
                {stopComments.map((comment) => (
                  <View key={comment.id} style={[styles.commentCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
                    <Text style={[typography.caption, { color: theme.colors.inkMuted }]}>{comment.authorName}</Text>
                    <Text style={[typography.body, { color: theme.colors.ink, marginTop: 2, fontSize: 13 }]}>{comment.text}</Text>
                  </View>
                ))}
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <TextField label="Commentaire" value={commentText} onChangeText={setCommentText} placeholder={`À propos de ${selectedStop.name}…`} />
                  </View>
                  <View style={{ justifyContent: "flex-end" }}>
                    <Button
                      label="Envoyer"
                      variant="secondary"
                      onPress={() => { if (commentText.trim() && selectedStopId) { addComment(tripId, selectedStopId, meName, commentText.trim()); setCommentText(""); } }}
                    />
                  </View>
                </View>
              </View>
            ) : null}
          </>
        )}
      </FieldGroup>

      {!conflict ? (
        <Pressable onPress={() => triggerConflict(tripId)} style={styles.demoRow}>
          <Ionicons name="flash-outline" size={14} color={theme.colors.inkMuted} />
          <Text style={[typography.caption, { color: theme.colors.inkMuted, textTransform: "none", letterSpacing: 0 }]}>
            Simuler une édition simultanée
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  mapPreview: { height: 180, borderRadius: radius.lg, borderWidth: 1, overflow: "hidden" },
  headerRow: { gap: 10 },
  proposalCard: { borderRadius: radius.md, borderWidth: 1, padding: 12 },
  proposalActions: { flexDirection: "row", gap: 8, marginTop: 10 },
  commentCard: { borderRadius: radius.md, borderWidth: 1, padding: 10 },
  demoRow: { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "center", height: 40 },
});
