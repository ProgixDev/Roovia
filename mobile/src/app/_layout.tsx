import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, useSegments } from "expo-router";
import * as NativeSplash from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  SafeAreaProvider,
  SafeAreaView,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";
import { queryClient } from "../lib/queryClient";

NativeSplash.preventAutoHideAsync();
NativeSplash.setOptions({ duration: 700, fade: true });

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <RootLayoutWithTheme />
          </SafeAreaProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutWithTheme() {
  const { theme } = useTheme();
  const segments = useSegments();

  useEffect(() => {
    NativeSplash.hideAsync();
  }, []);

  // The splash lives at the root `index` route, which is the only route with
  // no segments at all. Deliberately NOT `usePathname() === "/"`: a route
  // group adds no path segment, so `(tabs)/index` also resolves to "/" and
  // matching on the pathname stripped the top inset from the first tab.
  //
  // Cast because expo-router's typed routes narrow this to the tuple lengths
  // of the *nested* routes it generated (1 | 2) and omit the root index, so
  // TS rejects the `=== 0` comparison that is in fact the case at runtime.
  const isSplash = (segments as string[]).length === 0;

  // Onboarding's own hero photo is meant to bleed under the status bar (see
  // its `insets.top + 60` content padding, which assumes the image itself
  // already starts at y=0) — consuming the top inset here too would leave a
  // plain-color strip above the photo instead of a true full-bleed image.
  const isFullBleed = isSplash || (segments as string[])[0] === "onboarding";

  return (
    // Only the top inset, never the bottom. React Navigation's bottom tabs
    // (v7) already reserve `insets.bottom` inside the tab bar itself (see
    // `(tabs)/_layout.tsx`), so applying it here too left a visible gap under
    // the bar on every tab. Any screen NOT under the tab bar owns its own
    // bottom inset.
    <SafeAreaView
      edges={isFullBleed ? [] : ["top"]}
      style={{ flex: 1, backgroundColor: theme.background.dark }}
    >
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background.dark },
          animation: "fade_from_bottom",
        }}
      >
        <Stack.Screen name="index" options={{ animation: "fade" }} />
        <Stack.Screen name="onboarding/index" options={{ animation: "fade" }} />
        <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
      </Stack>
    </SafeAreaView>
  );
}
