import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "../../components/ui/Button";
import { Chip } from "../../components/ui/Chip";
import { FieldGroup } from "../../components/ui/FieldGroup";
import { TextField } from "../../components/ui/TextField";
import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import type { LatLng, PoiKind } from "./types";
import { POI_KIND_LABEL } from "./types";

const KINDS: PoiKind[] = ["fuel", "water", "dumpStation", "toilets", "bivouac", "campsite", "viewpoint", "market", "parking"];

interface SubmitPoiSheetProps {
  visible: boolean;
  onClose: () => void;
  position: LatLng;
  onSubmit: (input: { name: string; kind: PoiKind; description: string; coordinate: LatLng }) => void;
}

/** No "drop a pin" interaction yet — the submission uses the same mock position as "Autour de moi", disclosed in IMPLEMENTATION_PLAN.md §6. */
export function SubmitPoiSheet({ visible, onClose, position, onSubmit }: SubmitPoiSheetProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [kind, setKind] = useState<PoiKind>("bivouac");
  const [description, setDescription] = useState("");

  const reset = () => {
    setName("");
    setKind("bivouac");
    setDescription("");
  };

  const submit = () => {
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), kind, description: description.trim(), coordinate: position });
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fermer" />
      <View style={[styles.sheet, { backgroundColor: theme.colors.surfaceRaised, paddingBottom: insets.bottom + 20 }]}>
        <Text style={[typography.sectionHead, { color: theme.colors.ink, fontSize: 22 }]}>Proposer un lieu</Text>
        <ScrollView style={{ marginTop: 16 }} contentContainerStyle={{ gap: 20 }} keyboardShouldPersistTaps="handled">
          <TextField label="Nom du lieu" value={name} onChangeText={setName} placeholder="Aire de bivouac au bord du lac" />

          <FieldGroup label="Type">
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {KINDS.map((k) => (
                <Chip key={k} label={POI_KIND_LABEL[k]} selected={kind === k} onPress={() => setKind(k)} />
              ))}
            </View>
          </FieldGroup>

          <TextField
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Ce qu'on y trouve, comment y accéder…"
            multiline
            style={{ minHeight: 80 }}
          />

          <Button label="Envoyer" onPress={submit} disabled={!name.trim()} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, maxHeight: "85%", borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: 20 },
});
