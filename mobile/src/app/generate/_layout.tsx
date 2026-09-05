import { Stack } from "expo-router";

import { useTheme } from "../../contexts/ThemeContext";

/**
 * A nested stack so `index` (prompt) → `guided` / `running` push within the
 * same sheet instead of each opening its own modal — the root layout
 * presents this whole group as one modal (`Stack.Screen name="generate"`).
 */
export default function GenerateLayout() {
  const { theme } = useTheme();

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.ground } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="guided" />
      <Stack.Screen name="running" />
    </Stack>
  );
}
