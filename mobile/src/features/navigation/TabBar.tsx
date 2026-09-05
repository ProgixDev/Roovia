import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import { Add, type Icon as IconsaxIcon } from "iconsax-react-native";
import { Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";

/**
 * A floating pill of tabs beside a separate circular `+` button — the
 * layout from the old TabDesign9 template, minus the part that made it a
 * template: pressing `+` there grew the pill into an overflow grid of
 * destinations that didn't fit. This app only ever has the 4 approved tabs
 * (see `(tabs)/_layout.tsx`) and one real action behind `+` — AI trip
 * generation — so there is nothing to expand into. `+` just calls
 * `onPressFab` directly.
 */
export interface TabConfig {
  /** Route file name inside `app/(tabs)`, without the extension. */
  name: string;
  title: string;
  icon: IconsaxIcon;
  badge?: number;
}

const BAR_HEIGHT = 64;
const FAB_SIZE = BAR_HEIGHT;
const PANEL_RADIUS = BAR_HEIGHT / 2;
const FAB_GAP = 12;
const ICON_SIZE = 22;
const LABEL_FONT_SIZE = 11;
const LABEL_GAP = 4;
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

  return (
    <View
      style={[
        styles.wrap,
        { paddingBottom: Math.max(insets.bottom, MIN_BOTTOM_GAP), paddingHorizontal: GUTTER },
      ]}
      pointerEvents="box-none"
    >
      <View style={[styles.pill, { backgroundColor: theme.colors.surface }, SHADOW]}>
        {state.routes.map((route, index) => {
          const tab = tabs.find((t) => t.name === route.name);
          if (!tab) return null;

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
              style={({ pressed }) => ({ paddingHorizontal: 12, alignItems: "center", opacity: pressed ? 0.6 : 1 })}
            >
              <View>
                <Icon size={ICON_SIZE} color={tint} variant={focused ? "Bold" : "Linear"} />
                {badge > 0 ? (
                  <View style={[styles.badge, { backgroundColor: BADGE_COLOR, borderColor: theme.colors.surface }]} />
                ) : null}
              </View>
              <Text numberOfLines={1} style={[typography.caption, styles.label, { color: tint }]}>
                {tab.title}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Générer un voyage"
        onPress={onPressFab}
        style={({ pressed }) => [styles.fab, { backgroundColor: theme.colors.blaze, opacity: pressed ? 0.85 : 1 }, SHADOW]}
      >
        <Add size={26} color={theme.colors.blazeInk} variant="Linear" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", alignItems: "flex-end" },
  pill: {
    flex: 1,
    height: BAR_HEIGHT,
    borderRadius: PANEL_RADIUS,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  fab: {
    marginLeft: FAB_GAP,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { marginTop: LABEL_GAP, textTransform: "none", letterSpacing: 0, fontSize: LABEL_FONT_SIZE },
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
