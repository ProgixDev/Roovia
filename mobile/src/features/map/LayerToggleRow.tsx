import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, Pressable, StyleSheet, Text, View } from "react-native";

import { mapPins, radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import { PaywallSheet } from "../paywall/PaywallSheet";
import { PREMIUM_POI_KINDS, useEntitlementsStore } from "../../store/entitlementsStore";
import { usePoiStore } from "../../store/poiStore";
import { CATEGORY_BY_KIND, POI_KIND_LABEL, type PoiKind } from "./types";

const KINDS: PoiKind[] = ["fuel", "water", "dumpStation", "toilets", "bivouac", "campsite", "viewpoint", "market", "parking"];

export function LayerToggleRow() {
  const { theme } = useTheme();
  const visibleKinds = usePoiStore((s) => s.visibleKinds);
  const toggleKind = usePoiStore((s) => s.toggleKind);
  const entitlementActive = useEntitlementsStore((s) => s.entitlement.active);
  const [paywallOpen, setPaywallOpen] = useState(false);

  const isLocked = (kind: PoiKind) => !entitlementActive && (PREMIUM_POI_KINDS as readonly string[]).includes(kind);

  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {KINDS.map((kind) => {
          const locked = isLocked(kind);
          const active = visibleKinds.includes(kind) && !locked;
          const color = mapPins[CATEGORY_BY_KIND[kind]];
          return (
            <Pressable
              key={kind}
              onPress={() => (locked ? setPaywallOpen(true) : toggleKind(kind))}
              style={[
                styles.chip,
                { backgroundColor: active ? theme.colors.surface : theme.colors.surfaceSunken, borderColor: active ? color : theme.colors.line, opacity: active ? 1 : 0.6 },
              ]}
            >
              {locked ? <Ionicons name="lock-closed" size={11} color={theme.colors.inkMuted} /> : <View style={[styles.dot, { backgroundColor: color }]} />}
              <Text style={[typography.button, { color: theme.colors.ink, fontSize: 12 }]}>{POI_KIND_LABEL[kind]}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <PaywallSheet visible={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, height: 34, paddingHorizontal: 12, borderRadius: radius.pill, borderWidth: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
