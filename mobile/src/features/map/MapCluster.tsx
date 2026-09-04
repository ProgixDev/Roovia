import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../../contexts/ThemeContext";
import { typography } from "../../constants/typography";

interface MapClusterProps {
  count: number;
}

/** Groups of same-category pins too close to render individually at this zoom. */
export function MapCluster({ count }: MapClusterProps) {
  const { theme } = useTheme();
  const size = count >= 100 ? 44 : count >= 10 ? 38 : 32;

  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.colors.ink,
          borderColor: theme.colors.ground,
        },
      ]}
    >
      <Text style={[typography.button, { color: theme.colors.ground, fontSize: 13 }]}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
});
