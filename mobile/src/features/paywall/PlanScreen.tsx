import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "../../components/ui/Button";
import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import { formatDate } from "../../lib/format";
import { useEntitlementsStore } from "../../store/entitlementsStore";
import { PaywallSheet } from "./PaywallSheet";

const PLAN_LABEL: Record<string, string> = {
  free: "Gratuit",
  monthly: "Mensuel",
  annual: "Annuel",
  trip_pass: "Pass voyage",
};

const MANAGE_SUBSCRIPTION_URL = Platform.select({
  ios: "https://apps.apple.com/account/subscriptions",
  android: "https://play.google.com/store/account/subscriptions",
  default: "https://apps.apple.com/account/subscriptions",
});

export default function PlanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const entitlement = useEntitlementsStore((s) => s.entitlement);
  const generationsRemaining = useEntitlementsStore((s) => s.generationsRemaining);
  const simulateGracePeriod = useEntitlementsStore((s) => s.simulateGracePeriod);
  const simulateExpired = useEntitlementsStore((s) => s.simulateExpired);
  const [paywallOpen, setPaywallOpen] = useState(false);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/profil" as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.ground }}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.header}>
          <Pressable onPress={goBack} hitSlop={14} style={styles.headerButton}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.ink} />
          </Pressable>
        </View>

        <Text style={[typography.sectionHead, { color: theme.colors.ink }]}>Mon abonnement</Text>

        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
          <Text style={[typography.caption, { color: theme.colors.inkMuted }]}>Plan actuel</Text>
          <Text style={[typography.heroStat, { color: theme.colors.ink, fontSize: 28, marginTop: 6 }]}>{PLAN_LABEL[entitlement.plan]}</Text>

          {entitlement.active && entitlement.expiresAt ? (
            <Text style={[typography.body, { color: theme.colors.inkMuted, marginTop: 8 }]}>
              Renouvellement le {formatDate(new Date(entitlement.expiresAt))}
            </Text>
          ) : (
            <Text style={[typography.body, { color: theme.colors.inkMuted, marginTop: 8 }]}>
              {generationsRemaining()} génération(s) gratuite(s) restante(s) ce mois-ci
            </Text>
          )}

          {entitlement.inGracePeriod ? (
            <View style={[styles.warning, { backgroundColor: theme.colors.surfaceSunken }]}>
              <Ionicons name="warning-outline" size={16} color={theme.colors.amber} />
              <Text style={[typography.body, { color: theme.colors.inkMuted, fontSize: 12, flex: 1 }]}>
                Un problème de paiement a été détecté — mettez à jour votre moyen de paiement pour garder votre accès Premium.
              </Text>
            </View>
          ) : null}
        </View>

        {entitlement.active ? (
          <Button label="Gérer mon abonnement" variant="secondary" icon="open-outline" onPress={() => Linking.openURL(MANAGE_SUBSCRIPTION_URL)} />
        ) : (
          <Button label="Passer à Premium" icon="sparkles" onPress={() => setPaywallOpen(true)} />
        )}

        <View style={[styles.devCard, { borderColor: theme.colors.line }]}>
          <Text style={[typography.caption, { color: theme.colors.inkMuted }]}>Démo — simuler un état</Text>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
            <View style={{ flex: 1 }}>
              <Button label="Grâce" variant="secondary" onPress={simulateGracePeriod} />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="Expiration" variant="secondary" onPress={simulateExpired} />
            </View>
          </View>
        </View>
      </ScrollView>

      <PaywallSheet visible={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 16, gap: 20 },
  header: { flexDirection: "row" },
  headerButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  card: { borderRadius: radius.lg, borderWidth: 1, padding: 18 },
  warning: { flexDirection: "row", gap: 10, alignItems: "flex-start", padding: 12, borderRadius: radius.md, marginTop: 14 },
  devCard: { borderRadius: radius.md, borderWidth: 1, borderStyle: "dashed", padding: 14 },
});
