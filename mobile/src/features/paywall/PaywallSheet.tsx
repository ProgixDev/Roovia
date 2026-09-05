import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "../../components/ui/Button";
import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import type { PlanId } from "../../lib/purchases";
import { useEntitlementsStore } from "../../store/entitlementsStore";

const FEATURES = [
  "Générations de voyage illimitées",
  "Toutes les couches de la carte des services",
  "Suggestions de recalcul illimitées",
  "Export et partage sans limite",
];

interface PaywallSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function PaywallSheet({ visible, onClose }: PaywallSheetProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const purchase = useEntitlementsStore((s) => s.purchase);
  const restore = useEntitlementsStore((s) => s.restore);
  const [selected, setSelected] = useState<PlanId>("annual");
  const [busy, setBusy] = useState(false);

  const buy = async (plan: PlanId) => {
    setBusy(true);
    await purchase(plan);
    setBusy(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fermer" />
      <View style={[styles.sheet, { backgroundColor: theme.colors.surfaceRaised, paddingBottom: insets.bottom + 20 }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[styles.hero, { backgroundColor: theme.colors.blaze }]}>
            <Ionicons name="sparkles" size={32} color={theme.colors.blazeInk} />
            <Text style={[typography.heroStat, { color: theme.colors.blazeInk, fontSize: 28, marginTop: 10 }]}>Roovia Premium</Text>
            <Text style={[typography.body, { color: theme.colors.blazeInk, marginTop: 4, textAlign: "center" }]}>
              Planifiez sans limite, partout où la route vous mène.
            </Text>
          </View>

          <View style={styles.body}>
            <View style={{ gap: 10 }}>
              {FEATURES.map((feature) => (
                <View key={feature} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={18} color={theme.colors.moss} />
                  <Text style={[typography.body, { color: theme.colors.ink, flex: 1 }]}>{feature}</Text>
                </View>
              ))}
            </View>

            <View style={{ gap: 10, marginTop: 24 }}>
              <PlanOption
                selected={selected === "annual"}
                onPress={() => setSelected("annual")}
                title="Abonnement annuel"
                price="49,99 € / an"
                badge="−30 %"
              />
              <PlanOption
                selected={selected === "monthly"}
                onPress={() => setSelected("monthly")}
                title="Abonnement mensuel"
                price="5,99 € / mois"
              />
              <PlanOption
                selected={selected === "trip_pass"}
                onPress={() => setSelected("trip_pass")}
                title="Pass voyage (30 jours)"
                price="3,99 €"
              />
            </View>

            <View style={{ marginTop: 20 }}>
              <Button label={busy ? "Un instant…" : "Continuer"} onPress={() => buy(selected)} disabled={busy} />
            </View>

            <Pressable onPress={() => restore()} style={styles.restore}>
              <Text style={[typography.button, { color: theme.colors.inkMuted, fontSize: 13 }]}>Restaurer mes achats</Text>
            </Pressable>

            <Text style={[typography.body, { color: theme.colors.inkMuted, fontSize: 11, textAlign: "center", marginTop: 12 }]}>
              Renouvellement automatique, résiliable à tout moment depuis les réglages de votre compte App Store / Google Play.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function PlanOption({ selected, onPress, title, price, badge }: { selected: boolean; onPress: () => void; title: string; price: string; badge?: string }) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.plan, { borderColor: selected ? theme.colors.blaze : theme.colors.line, backgroundColor: selected ? theme.colors.surface : "transparent" }]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[typography.button, { color: theme.colors.ink }]}>{title}</Text>
        <Text style={[typography.body, { color: theme.colors.inkMuted, fontSize: 13, marginTop: 2 }]}>{price}</Text>
      </View>
      {badge ? (
        <View style={[styles.badge, { backgroundColor: theme.colors.moss }]}>
          <Text style={[typography.caption, { color: "#FFFFFF" }]}>{badge}</Text>
        </View>
      ) : null}
      <Ionicons name={selected ? "radio-button-on" : "radio-button-off"} size={20} color={selected ? theme.colors.blaze : theme.colors.inkMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, maxHeight: "88%", borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, overflow: "hidden" },
  hero: { alignItems: "center", padding: 28 },
  body: { padding: 20 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  plan: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 2, borderRadius: radius.md, padding: 14 },
  badge: { paddingHorizontal: 8, height: 22, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  restore: { height: 40, alignItems: "center", justifyContent: "center", marginTop: 8 },
});
