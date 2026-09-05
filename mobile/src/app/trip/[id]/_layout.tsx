import { Stack } from "expo-router";

import { useTheme } from "../../../contexts/ThemeContext";

/** `suggestions` pushes on top of `index` within this same stack — not its own modal. */
export default function TripLayout() {
  const { theme } = useTheme();

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.ground } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="suggestions" />
    </Stack>
  );
}
