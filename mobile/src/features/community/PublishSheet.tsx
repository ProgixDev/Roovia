import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "../../components/ui/Button";
import { Chip } from "../../components/ui/Chip";
import { FieldGroup } from "../../components/ui/FieldGroup";
import { Switch } from "../../components/ui/Switch";
import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import type { Visibility } from "../../store/communityStore";

const VISIBILITY_LABEL: Record<Visibility, string> = { public: "Public", amis: "Amis uniquement", prive: "Privé" };

interface PublishSheetProps {
  visible: boolean;
  onClose: () => void;
  onPublish: (visibility: Visibility, scrubCoordinates: boolean) => void;
}

/** Coordinates for `sleep_free`/`sleep_paid` stops get fuzzed by ~500m when the scrub is on — the toggle a real publish flow would need for anyone's home or a bivouac they'd rather not pinpoint exactly. */
export function PublishSheet({ visible, onClose, onPublish }: PublishSheetProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [scrub, setScrub] = useState(true);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fermer" />
      <View style={[styles.sheet, { backgroundColor: theme.colors.surfaceRaised, paddingBottom: insets.bottom + 20 }]}>
        <Text style={[typography.sectionHead, { color: theme.colors.ink, fontSize: 22 }]}>Publier ce voyage</Text>

        <FieldGroup label="Visibilité">
          <View style={{ flexDirection: "row", gap: 8 }}>
            {(Object.keys(VISIBILITY_LABEL) as Visibility[]).map((v) => (
              <Chip key={v} label={VISIBILITY_LABEL[v]} selected={visibility === v} onPress={() => setVisibility(v)} />
            ))}
          </View>
        </FieldGroup>

        <Pressable onPress={() => setScrub((s) => !s)} style={styles.scrubRow}>
          <Switch value={scrub} onChange={setScrub} />
          <View style={{ flex: 1 }}>
            <Text style={[typography.button, { color: theme.colors.ink }]}>Flouter les coordonnées sensibles</Text>
            <Text style={[typography.body, { color: theme.colors.inkMuted, fontSize: 12, marginTop: 2 }]}>
              Vos étapes de bivouac gratuit gardent une position approximative plutôt que le point exact.
            </Text>
          </View>
        </Pressable>

        <View style={{ marginTop: 8 }}>
          <Button label="Publier" icon="cloud-upload-outline" onPress={() => { onPublish(visibility, scrub); onClose(); }} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: 20, gap: 20 },
  scrubRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
});
