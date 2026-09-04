import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { SetupLayout } from "../../features/setup/SetupLayout";
import { Button } from "../../components/ui/Button";
import { Chip } from "../../components/ui/Chip";
import { FieldGroup } from "../../components/ui/FieldGroup";
import { TextField } from "../../components/ui/TextField";
import { type VehicleType, useProfileStore } from "../../store/profileStore";

const VEHICLE_OPTIONS: { value: VehicleType; label: string }[] = [
  { value: "van", label: "Van" },
  { value: "fourgon", label: "Fourgon" },
  { value: "camping_car", label: "Camping-car" },
  { value: "heavy_truck", label: "Poids lourd" },
  { value: "converted_car", label: "Véhicule aménagé" },
];

export default function VehicleSetupScreen() {
  const router = useRouter();
  const vehicle = useProfileStore((s) => s.vehicle);
  const updateVehicle = useProfileStore((s) => s.updateVehicle);
  const advanceTo = useProfileStore((s) => s.advanceTo);

  const [type, setType] = useState(vehicle.type);
  const [heightM, setHeightM] = useState(vehicle.heightM);
  const [lengthM, setLengthM] = useState(vehicle.lengthM);
  const [widthM, setWidthM] = useState(vehicle.widthM);

  const next = async () => {
    await updateVehicle({ type, heightM, lengthM, widthM });
    await advanceTo(2);
    router.push("/setup/trip" as any);
  };

  return (
    <SetupLayout
      step={1}
      showBack
      title="Quel est votre véhicule ?"
      subtitle="Pour un itinéraire vraiment adapté."
      hint="Les dimensions permettent d'éviter les routes et parkings que votre véhicule ne peut pas franchir — ponts bas, rues étroites, barrières à hauteur limitée."
      footer={<Button label="Suivant" onPress={next} />}
    >
      <FieldGroup label="Type de véhicule">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {VEHICLE_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={type === option.value}
              onPress={() => setType(option.value)}
            />
          ))}
        </View>
      </FieldGroup>

      <FieldGroup label="Dimensions">
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <TextField
              label="Hauteur (m)"
              value={heightM}
              onChangeText={setHeightM}
              placeholder="2,9"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextField
              label="Longueur (m)"
              value={lengthM}
              onChangeText={setLengthM}
              placeholder="5,9"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextField
              label="Largeur (m)"
              value={widthM}
              onChangeText={setWidthM}
              placeholder="2,1"
              keyboardType="decimal-pad"
            />
          </View>
        </View>
      </FieldGroup>
    </SetupLayout>
  );
}
