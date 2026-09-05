import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ActionSheet, type ActionSheetAction } from "../../../components/ui/ActionSheet";
import { Button } from "../../../components/ui/Button";
import { EmptyState } from "../../../components/ui/EmptyState";
import { typography } from "../../../constants/typography";
import { VehicleCard } from "../../../features/vehicle/VehicleCard";
import { useSettingsStore } from "../../../store/settingsStore";
import { useVehiclesStore } from "../../../store/vehiclesStore";
import { useTheme } from "../../../contexts/ThemeContext";

export default function VehicleGarageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { vehicles, activeId, hydrate, setActive, duplicateVehicle, removeVehicle } = useVehiclesStore();
  const units = useSettingsStore((s) => s.units);
  const [menuId, setMenuId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      hydrate();
    }, [hydrate]),
  );

  const menuVehicle = vehicles.find((v) => v.id === menuId) ?? null;

  // A root-level stack route, like /account — no tab bar to clear, but also
  // no native header (the root Stack renders `headerShown: false`
  // everywhere), so this needs its own back chevron the same way /account
  // provides one, or there's simply no way back to the Profile tab.
  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/profil" as any);
  };

  const actionsFor = (id: string): ActionSheetAction[] => [
    { key: "active", label: "Définir comme actif", icon: "checkmark-circle-outline", onPress: () => setActive(id) },
    { key: "edit", label: "Modifier", icon: "create-outline", onPress: () => router.push(`/profile/vehicles/${id}/basics` as any) },
    { key: "duplicate", label: "Dupliquer", icon: "copy-outline", onPress: () => duplicateVehicle(id) },
    { key: "delete", label: "Supprimer", icon: "trash-outline", destructive: true, onPress: () => removeVehicle(id) },
  ];

  if (vehicles.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.ground }}>
        <View style={[styles.header, { paddingHorizontal: 20, paddingTop: 16 }]}>
          <Pressable onPress={goBack} hitSlop={14} style={styles.back}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.ink} />
          </Pressable>
          <Text style={[typography.sectionHead, { color: theme.colors.ink }]} numberOfLines={1}>
            Mes véhicules
          </Text>
        </View>
        <EmptyState
          icon="car-outline"
          title="Aucun véhicule"
          body="Ajoutez votre van ou camping-car pour que l'IA et la carte des services tiennent compte de son gabarit."
          action={{ label: "Ajouter un véhicule", icon: "add", onPress: () => router.push("/profile/vehicles/new/basics" as any) }}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.ground }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: insets.bottom + 24,
          gap: 14,
        }}
      >
        <View style={styles.header}>
          <Pressable onPress={goBack} hitSlop={14} style={styles.back}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.ink} />
          </Pressable>
          <Text style={[typography.sectionHead, { color: theme.colors.ink }]} numberOfLines={1}>
            Mes véhicules
          </Text>
        </View>

        {vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            active={vehicle.id === activeId}
            units={units}
            onPress={() => router.push(`/profile/vehicles/${vehicle.id}/basics` as any)}
            onPressMore={() => setMenuId(vehicle.id)}
          />
        ))}

        <Button label="Ajouter un véhicule" variant="secondary" icon="add" onPress={() => router.push("/profile/vehicles/new/basics" as any)} />
      </ScrollView>

      <ActionSheet
        visible={menuVehicle !== null}
        onClose={() => setMenuId(null)}
        title={menuVehicle?.name}
        actions={menuVehicle ? actionsFor(menuVehicle.id) : []}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 6 },
  back: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
});
