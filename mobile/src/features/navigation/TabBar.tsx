import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { type Icon as IconsaxIcon } from "iconsax-react-native";
import { Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { typography } from "../../constants/typography";
import { radius } from "../../constants/themes";
import { useTheme } from "../../contexts/ThemeContext";

/**
 * Real navigation, extracted out of `components/screens/tabs/TabDesign9`
 * (template scaffolding — see `.agents/AGENTS.md`) and simplified: that
 * design's `+` opened an overflow grid of not-yet-built destinations. This
 * app's `+` is a real action — AI trip generation — so there is no grid to
 * open, just a `onPressFab` callback the route layout wires to `/generate`.
 */
export interface TabConfig {
  /** Route file name inside `app/(tabs)`, without the extension. */
  name: string;
  title: string;
  icon: IconsaxIcon;
  badge?: number;
}

const BAR_HEIGHT = 64;
const FAB_SIZE = 48;
const ICON_SIZE = 22;
const LABEL_FONT_SIZE = 11;
const GUTTER = 16;
const MIN_BOTTOM_GAP = 12;

/** Bottom padding a screen needs so its content clears the floating bar. */
export const TAB_BAR_CLEARANCE = BAR_HEIGHT + 24;

const BADGE_COLOR = "#e5484d";
const BADGE_SIZE = 9;

const SHADOW: ViewStyle =
  Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#000000",
      shadowOpacity: 0.15,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
    },
    android: { elevation: 8, shadowColor: "#000000" },
    default: {},
  }) ?? {};

function Bar({ state, navigation, tabs, onPressFab }: BottomTabBarProps & { tabs: TabConfig[]; onPressFab: () => void }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  // Exactly 4 destinations either side of the center action, per the
  // approved IA (Voyages · Carte · [+] · Communauté · Profil) — not a
  // generic "N tabs + fab in the middle" layout, because the app isn't
  // going to grow past 4 without a design revisit anyway.
  const left = tabs.slice(0, 2);
  const right = tabs.slice(2, 4);

  const renderTab = (tab: TabConfig) => {
    const index = state.routes.findIndex((r) => r.name === tab.name);
    if (index === -1) return null;
    const route = state.routes[index];
    const focused = state.index === index;
    const badge = tab.badge ?? 0;
    const Icon = tab.icon;
    const tint = focused ? theme.colors.blaze : theme.colors.inkMuted;

    return (
      <Pressable
        key={route.key}
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={badge > 0 ? `${tab.title}, ${badge}` : tab.title}
        onPress={() => {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        }}
        style={({ pressed }) => ({ flex: 1, alignItems: "center", opacity: pressed ? 0.6 : 1 })}
      >
        <View>
          <Icon size={ICON_SIZE} color={tint} variant={focused ? "Bold" : "Linear"} />
          {badge > 0 ? (
            <View
              style={[
                styles.badge,
                { backgroundColor: BADGE_COLOR, borderColor: theme.colors.surface },
              ]}
            />
          ) : null}
        </View>
        <Text numberOfLines={1} style={[typography.caption, styles.label, { color: tint }]}>
          {tab.title}
        </Text>
      </Pressable>
    );
  };

  return (
    <View
      style={[
        styles.wrap,
        { paddingBottom: Math.max(insets.bottom, MIN_BOTTOM_GAP), paddingHorizontal: GUTTER },
      ]}
      pointerEvents="box-none"
    >
      <View style={[styles.bar, { backgroundColor: theme.colors.surface }, SHADOW]}>
        {left.map(renderTab)}

        <View style={styles.fabSlot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Générer un voyage"
            onPress={onPressFab}
            style={({ pressed }) => [
              styles.fab,
              { backgroundColor: theme.colors.blaze, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Ionicons name="add" size={26} color={theme.colors.blazeInk} />
          </Pressable>
        </View>

        {right.map(renderTab)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, bottom: 0 },
  bar: {
    height: BAR_HEIGHT,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  fabSlot: { width: FAB_SIZE + 16, alignItems: "center", justifyContent: "center" },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { marginTop: 3, textTransform: "none", letterSpacing: 0, fontSize: LABEL_FONT_SIZE },
  badge: {
    position: "absolute",
    top: -2,
    right: -3,
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    borderWidth: 1,
  },
});

export function TabBar({ tabs, onPressFab }: { tabs: TabConfig[]; onPressFab: () => void }) {
  const { theme } = useTheme();

  return (
    <Tabs
      tabBar={(props) => <Bar {...props} tabs={tabs} onPressFab={onPressFab} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.colors.ground },
      }}
    >
      {tabs.map(({ name, title }) => (
        <Tabs.Screen key={name} name={name} options={{ title }} />
      ))}
    </Tabs>
  );
}
