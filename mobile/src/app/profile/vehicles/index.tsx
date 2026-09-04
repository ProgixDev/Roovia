import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ActionSheet, type ActionSheetAction } from "../../../components/ui/ActionSheet";
import { Button } from "../../../components/ui/Button";
import { EmptyState } from "../../../components/ui/EmptyState";
import { tabBarReservedSpace } from "../../../constants/layout";
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

  const actionsFor = (id: string): ActionSheetAction[] => [
    { key: "active", label: "Définir comme actif", icon: "checkmark-circle-outline", onPress: () => setActive(id) },
    { key: "edit", label: "Modifier", icon: "create-outline", onPress: () => router.push(`/profile/vehicles/${id}/type` as any) },
    { key: "duplicate", label: "Dupliquer", icon: "copy-outline", onPress: () => duplicateVehicle(id) },
    { key: "delete", label: "Supprimer", icon: "trash-outline", destructive: true, onPress: () => removeVehicle(id) },
  ];

  if (vehicles.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.ground, paddingTop: 16 }}>
        <EmptyState
          icon="car-outline"
          title="Aucun véhicule"
          body="Ajoutez votre van ou camping-car pour que l'IA et la carte des services tiennent compte de son gabarit."
          action={{ label: "Ajouter un véhicule", icon: "add", onPress: () => router.push("/profile/vehicles/new/type" as any) }}
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
          paddingBottom: tabBarReservedSpace(insets.bottom) + 24,
          gap: 14,
        }}
      >
        {vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            active={vehicle.id === activeId}
            units={units}
            onPress={() => router.push(`/profile/vehicles/${vehicle.id}/type` as any)}
            onPressMore={() => setMenuId(vehicle.id)}
          />
        ))}

        <Button label="Ajouter un véhicule" variant="secondary" icon="add" onPress={() => router.push("/profile/vehicles/new/type" as any)} />
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
