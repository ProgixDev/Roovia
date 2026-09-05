import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import type { VehicleType } from "../../store/vehiclesStore";
import { VEHICLE_TYPE_LABEL } from "./labels";

// `heavy_truck` is dropped from the picker per product decision — it stays
// a valid `VehicleType` in the store (so an existing poids-lourd vehicle's
// data isn't corrupted), it's just no longer a selectable option here.
const GRID_TYPES = ["fourgon", "van", "camping_car", "converted_car"] as const;

const TYPE_IMAGE: Record<(typeof GRID_TYPES)[number], number> = {
  fourgon: require("../../../assets/images/vehicles/van.png"),
  van: require("../../../assets/images/vehicles/camper-van.png"),
  camping_car: require("../../../assets/images/vehicles/motorhome.png"),
  converted_car: require("../../../assets/images/vehicles/converted-car.png"),
};

interface VehicleTypePickerProps {
  value: VehicleType;
  onChange: (value: VehicleType) => void;
}

export function VehicleTypePicker({ value, onChange }: VehicleTypePickerProps) {
  const { theme } = useTheme();
  const tint = `${theme.colors.blaze}1F`;

  return (
    <View style={styles.grid}>
      {GRID_TYPES.map((type) => {
        const selected = value === type;
        return (
          <Pressable
            key={type}
            onPress={() => onChange(type)}
            style={[
              styles.card,
              {
                backgroundColor: selected ? tint : theme.colors.surface,
                borderColor: selected ? theme.colors.blaze : theme.colors.line,
              },
            ]}
          >
            {selected ? (
              <View style={[styles.badge, { backgroundColor: theme.colors.blaze }]}>
                <Ionicons name="checkmark" size={14} color={theme.colors.blazeInk} />
              </View>
            ) : null}
            <Image source={TYPE_IMAGE[type]} style={styles.image} contentFit="contain" />
            <Text style={[typography.button, { color: theme.colors.ink, marginTop: 8 }]}>{VEHICLE_TYPE_LABEL[type]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: {
    flexGrow: 1,
    flexBasis: "45%",
    borderRadius: radius.lg,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  image: { width: "100%", height: 90 },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
});
