import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import { Platform, Pressable, Text, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../../../contexts/ThemeContext";

// Deliberately redeclared per design rather than shared: each TabDesign* file
// stands alone, so deleting the ones a project doesn't use leaves nothing
// dangling behind them. Field names match across designs, so the same
// `TabConfig[]` literal feeds whichever one a layout imports.
export type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export interface TabConfig {
  /** Route file name inside `app/(tabs)`, without the extension. */
  name: string;
  /** Label under the icon. */
  title: string;
  icon: IconName;
  iconFocused: IconName;
  /** Count shown on a small badge over the icon. Omit or pass 0 for none. */
  badge?: number;
}

/**
 * Bottom tab bar — design 2: a floating rounded pill that hovers over the
 * content rather than sitting in a bar docked to the bottom edge. Each column
 * gets a big icon, a permanent label, a soft tint when active, and a short
 * indicator docked to the top of the column.
 *
 * Unlike design 1 this bar is absolutely positioned, so screen content scrolls
 * *underneath* it. A screen rendered inside it must reserve
 * `TAB_BAR_CLEARANCE` of bottom padding or its last row ends up behind the
 * pill.
 *
 * Geometry is written as literals rather than borrowed from `spacing`: these
 * values come from a project whose 4pt scale is offset from this template's
 * (its `lg` is 16, ours is 24), so reusing token *names* would silently
 * redraw the design.
 */

/** Height of the pill itself, before safe-area insets. */
export const TAB_BAR_HEIGHT = 74;

/** Bottom padding a screen needs so its content clears the floating bar. */
export const TAB_BAR_CLEARANCE = TAB_BAR_HEIGHT + 24;

const GUTTER = 16;
const BAR_INSET = 8;
/** Floor under the safe-area inset, so the pill never hugs the screen edge. */
const MIN_BOTTOM_GAP = 12;
const PILL_RADIUS = 24;
const ITEM_RADIUS = 16;
const ICON_SIZE = 26;

/**
 * Active-column tint: the theme's primary at ~14% over the raised surface.
 *
 * An 8-digit #RRGGBBAA literal, which every theme variant here supports
 * because each defines `primary.main` as a 6-digit hex. Using `primary.light`
 * instead would fill the column with a near-solid accent and swallow the icon
 * drawn on top of it in `primary.main`.
 */
const SOFT_TINT_ALPHA = "24";

const BADGE_COLOR = "#b3261e";

/** Soft drop shadow — same values as design 8's FAB/pill. */
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

function FloatingTabBar({
  state,
  navigation,
  tabs,
}: BottomTabBarProps & { tabs: TabConfig[] }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingBottom: Math.max(insets.bottom, MIN_BOTTOM_GAP),
        paddingHorizontal: GUTTER,
      }}
      // Lets taps fall through the padding around the pill to the content
      // underneath, which is otherwise covered by this full-width container.
      pointerEvents="box-none"
    >
      <View
        style={[
          {
            flexDirection: "row",
            alignItems: "stretch",
            height: TAB_BAR_HEIGHT,
            paddingHorizontal: BAR_INSET,
            borderRadius: PILL_RADIUS,
            backgroundColor: theme.background.darker,
            borderWidth: 1,
            borderColor: theme.background.accent,
          },
          SHADOW,
        ]}
      >
        {state.routes.map((route, index) => {
          // Driven by the navigator's own route list, so a route with no entry
          // in `tabs` simply isn't drawn instead of rendering a blank column.
          const tab = tabs.find((t) => t.name === route.name);
          if (!tab) return null;

          const focused = state.index === index;
          const color = focused ? theme.primary.main : theme.foreground.gray;
          const badge = tab.badge ?? 0;

          return (
            <Pressable
              key={route.key}
              onPress={() => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={
                badge > 0 ? `${tab.title}, ${badge}` : tab.title
              }
              style={({ pressed }) => ({
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                marginVertical: BAR_INSET,
                borderRadius: ITEM_RADIUS,
                backgroundColor: focused
                  ? theme.primary.main + SOFT_TINT_ALPHA
                  : "transparent",
                opacity: pressed ? 0.6 : 1,
              })}
            >
              {/* Active indicator, docked to the top of the column. */}
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  width: 26,
                  height: 3,
                  borderRadius: 9999,
                  backgroundColor: focused ? theme.primary.main : "transparent",
                }}
              />

              <View>
                <MaterialCommunityIcons
                  name={focused ? tab.iconFocused : tab.icon}
                  size={ICON_SIZE}
                  color={color}
                />
                {badge > 0 ? (
                  <View
                    style={{
                      position: "absolute",
                      top: -5,
                      right: -9,
                      minWidth: 17,
                      height: 17,
                      paddingHorizontal: 4,
                      borderRadius: 9999,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: BADGE_COLOR,
                    }}
                  >
                    <Text
                      style={{ fontSize: 10, lineHeight: 13, color: "#ffffff" }}
                    >
                      {badge}
                    </Text>
                  </View>
                ) : null}
              </View>

              <Text style={{ fontSize: 11, color }} numberOfLines={1}>
                {tab.title}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function TabDesign2({ tabs }: { tabs: TabConfig[] }) {
  const { theme } = useTheme();

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} tabs={tabs} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.background.dark },
      }}
    >
      {tabs.map(({ name, title }) => (
        <Tabs.Screen key={name} name={name} options={{ title }} />
      ))}
    </Tabs>
  );
}

export default TabDesign2;
