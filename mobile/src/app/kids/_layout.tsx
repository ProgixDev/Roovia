import { Stack } from "expo-router";

import { kidsTheme } from "../../constants/kidsTheme";

/** Its own stack, its own background — kids mode never shows the main app's chrome underneath. */
export default function KidsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: kidsTheme.background } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="quiz" />
    </Stack>
  );
}
