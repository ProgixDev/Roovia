import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import { Add, type Icon as IconsaxIcon } from "iconsax-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  BackHandler,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../../../contexts/ThemeContext";

// Deliberately redeclared per design rather than shared: each TabDesign* file
// stands alone, so deleting the ones a project doesn't use leaves nothing
// dangling behind them.
//
// Icons: iconsax-react-native, same as designs 3/5/6. One field, not an
// icon/iconFocused pair — an iconsax component already draws either state
// via its own `variant` prop.
export interface TabConfig {
  /** Route file name inside `app/(tabs)`, without the extension. */
  name: string;
  /** Label under the icon. Always visible, active or not. */
  title: string;
  icon: IconsaxIcon;
  /** Count for the corner dot. Omit or pass 0 for none. */
  badge?: number;
}

/**
 * One entry in the grid the `+` button reveals — a destination that didn't
 * fit in the bar, not a command. Same shape as `TabConfig` minus `badge`,
 * because that is what these are: overflow tabs.
 */
export interface ActionConfig {
  /** Stable list key. Not a route file — see `onPress`. */
  key: string;
  /** Label under the icon. Always visible while the grid is open. */
  label: string;
  icon: IconsaxIcon;
  /**
   * Where this goes. Optional because the template has no routes behind
   * these — a tap still closes the grid, so nothing silently does nothing.
   * Point it at `router.push("/…")` once a project has the screen.
   */
  onPress?: () => void;
}

/**
 * Bottom tab bar — design 9: a floating pill of tabs beside a circular `+`
 * button, where pressing `+` grows the pill upward into a grid of the tabs
 * that didn't fit in the bar, and turns the button into a close `×`.
 *
 * ## How the morph works
 *
 * One `progress` shared value (0 collapsed, 1 expanded) drives everything:
 * the panel's height, the cross-fade between its two content layers, and
 * the button's rotation. Both layers are mounted at all times and pinned to
 * the panel's BOTTOM edge — the edge that doesn't move — so the grid stays
 * put while the panel grows past it, rather than sliding along with the top
 * edge. The panel clips, so the grid is simply out of view when collapsed.
 *
 * The `×` is the same `+` glyph rotated 45°, not a second icon: a plus and
 * a cross are the same shape at different angles, so rotating is both
 * fewer bytes and a continuous transition instead of a swap.
 *
 * ## Dismissal
 *
 * An open grid covers content, so it is dismissible three ways: the `×`,
 * a tap on the backdrop behind it, and the Android hardware back button.
 * Back is easy to forget and its absence is a genuine trap — an overlay
 * that swallows back leaves no obvious way out on a gesture-nav device.
 */

/** Tall enough for a 22pt icon, its label, and breathing room around both. */
const COLLAPSED_HEIGHT = 64;
const FAB_SIZE = COLLAPSED_HEIGHT;
/** Stadium when collapsed (height / 2), a rounded rect at full height — one value gives both. */
const PANEL_RADIUS = COLLAPSED_HEIGHT / 2;

const GUTTER = 16;
const MIN_BOTTOM_GAP = 12;
/** Space between the pill and the button beside it. */
const FAB_GAP = 12;

const ICON_SIZE = 22;
/** Shared by the bar's tab labels and the grid's, so the two read as one set. */
const LABEL_FONT_SIZE = 11;
/** Gap between an icon and the label under it, in both the bar and the grid. */
const LABEL_GAP = 4;
const GRID_COLUMNS = 4;
const GRID_ITEM_HEIGHT = 70;
const PANEL_PAD = 8;
const CARD_PAD = 8;

const TRANSITION_MS = 260;

/** Bottom padding a screen needs so its content clears the COLLAPSED bar. */
export const TAB_BAR_CLEARANCE = COLLAPSED_HEIGHT + 24;

/** Red on purpose: this is an unread/alert dot, not the app's accent. */
const BADGE_COLOR = "#e5484d";
const BADGE_SIZE = 9;

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

function ExpandableTabBar({
  state,
  navigation,
  tabs,
  actions,
}: BottomTabBarProps & { tabs: TabConfig[]; actions: ActionConfig[] }) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(false);
  const progress = useSharedValue(0);

  const rows = Math.ceil(actions.length / GRID_COLUMNS);
  const expandedHeight = PANEL_PAD * 2 + CARD_PAD * 2 + rows * GRID_ITEM_HEIGHT;

  useEffect(() => {
    progress.value = withTiming(expanded ? 1 : 0, {
      duration: TRANSITION_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [expanded, progress]);

  // An overlay that swallows the back button is a trap — close on back
  // instead, and only claim the event (`true`) while actually open so the
  // app's normal back behaviour is untouched the rest of the time.
  useEffect(() => {
    if (!expanded) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      setExpanded(false);
      return true;
    });
    return () => sub.remove();
  }, [expanded]);

  const close = useCallback(() => setExpanded(false), []);

  // Same wash-in-the-opposite-direction reasoning as designs 5 and 8: a
  // translucent white lifts a dark surface but vanishes on a light one.
  const cardColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const barColor = isDark ? theme.background.darker : theme.background.accent;
  const inactiveIcon = isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)";
  // The accent's light/dark end swaps with the mode, same as design 5's
  // `activeIconColor`: `primary.main` is a bright, light-toned colour in
  // every variant here, so it reads on a dark bar but washes out on a light
  // one — `primary.dark` is the legible end there.
  const activeIcon = isDark ? theme.primary.main : theme.primary.dark;

  const panelStyle = useAnimatedStyle(() => ({
    height: COLLAPSED_HEIGHT + progress.value * (expandedHeight - COLLAPSED_HEIGHT),
  }));

  const gridStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const rowStyle = useAnimatedStyle(() => ({ opacity: 1 - progress.value }));
  const fabIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 45}deg` }],
  }));

  return (
    <View style={[StyleSheet.absoluteFillObject, { justifyContent: "flex-end" }]} pointerEvents="box-none">
      {expanded ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close more tabs"
          onPress={close}
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      <View
        style={{
          paddingBottom: Math.max(insets.bottom, MIN_BOTTOM_GAP),
          paddingHorizontal: GUTTER,
          flexDirection: "row",
          // The button stays put at the bottom while the panel grows upward.
          alignItems: "flex-end",
        }}
        pointerEvents="box-none"
      >
        {/* Shadow sits on this wrapper rather than the clipping layer below:
            a view with `overflow: "hidden"` clips its own shadow away on
            iOS, so the two have to be separate layers. It also carries the
            background — an iOS shadow needs an opaque backing to render
            against. */}
        <View
          style={[
            { flex: 1, borderRadius: PANEL_RADIUS, backgroundColor: barColor },
            SHADOW,
          ]}
        >
          <Animated.View
            style={[{ overflow: "hidden", borderRadius: PANEL_RADIUS }, panelStyle]}
          >
            {/* Both layers are pinned to the bottom — the edge that stays
                still — so neither drifts while the panel's top edge moves. */}
            <Animated.View
              pointerEvents={expanded ? "auto" : "none"}
              style={[
                {
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: expandedHeight,
                  padding: PANEL_PAD,
                },
                gridStyle,
              ]}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  borderRadius: PANEL_RADIUS - PANEL_PAD,
                  backgroundColor: cardColor,
                  padding: CARD_PAD,
                }}
              >
                {actions.map((action) => {
                  const ActionIcon = action.icon;

                  return (
                    <Pressable
                      key={action.key}
                      accessibilityRole="button"
                      accessibilityLabel={action.label}
                      onPress={() => {
                        action.onPress?.();
                        close();
                      }}
                      style={({ pressed }) => ({
                        width: `${100 / GRID_COLUMNS}%`,
                        height: GRID_ITEM_HEIGHT,
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: pressed ? 0.6 : 1,
                      })}
                    >
                      {/* Same treatment as an INACTIVE tab in the bar — none
                          of these is the current route, so giving them the
                          accent would read as eleven active tabs at once. */}
                      <ActionIcon size={ICON_SIZE} color={inactiveIcon} variant="Linear" />
                      <Text
                        numberOfLines={1}
                        style={{
                          marginTop: LABEL_GAP,
                          fontSize: LABEL_FONT_SIZE,
                          color: inactiveIcon,
                        }}
                      >
                        {action.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Animated.View>

            <Animated.View
              pointerEvents={expanded ? "none" : "auto"}
              style={[
                {
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: COLLAPSED_HEIGHT,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-evenly",
                },
                rowStyle,
              ]}
            >
              {state.routes.map((route, index) => {
                // Driven by the navigator's own route list, so a route with
                // no entry in `tabs` simply isn't drawn instead of rendering
                // a blank column.
                const tab = tabs.find((t) => t.name === route.name);
                if (!tab) return null;

                const focused = state.index === index;
                const badge = tab.badge ?? 0;
                const Icon = tab.icon;

                return (
                  <Pressable
                    key={route.key}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: focused }}
                    accessibilityLabel={badge > 0 ? `${tab.title}, ${badge}` : tab.title}
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
                    style={({ pressed }) => ({
                      paddingHorizontal: 12,
                      alignItems: "center",
                      opacity: pressed ? 0.6 : 1,
                    })}
                  >
                    {/* Wraps the glyph alone so the badge anchors to the
                        icon's own corner rather than the taller column the
                        label now makes. */}
                    <View>
                      <Icon
                        size={ICON_SIZE}
                        color={focused ? activeIcon : inactiveIcon}
                        variant={focused ? "Bold" : "Linear"}
                      />

                      {badge > 0 ? (
                        <View
                          style={{
                            position: "absolute",
                            top: -2,
                            right: -3,
                            width: BADGE_SIZE,
                            height: BADGE_SIZE,
                            borderRadius: BADGE_SIZE / 2,
                            backgroundColor: BADGE_COLOR,
                          }}
                        />
                      ) : null}
                    </View>

                    <Text
                      numberOfLines={1}
                      style={{
                        marginTop: LABEL_GAP,
                        fontSize: LABEL_FONT_SIZE,
                        color: focused ? activeIcon : inactiveIcon,
                      }}
                    >
                      {tab.title}
                    </Text>
                  </Pressable>
                );
              })}
            </Animated.View>
          </Animated.View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={expanded ? "Close more tabs" : "More tabs"}
          accessibilityState={{ expanded }}
          onPress={() => setExpanded((v) => !v)}
          style={({ pressed }) => [
            {
              marginLeft: FAB_GAP,
              width: FAB_SIZE,
              height: FAB_SIZE,
              borderRadius: FAB_SIZE / 2,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: barColor,
              opacity: pressed ? 0.85 : 1,
            },
            SHADOW,
          ]}
        >
          {/* The `×` is this same glyph at 45° — see the class doc. */}
          <Animated.View style={fabIconStyle}>
            <Add size={26} color={theme.foreground.white} variant="Linear" />
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}

export function TabDesign9({
  tabs,
  actions,
}: {
  tabs: TabConfig[];
  actions: ActionConfig[];
}) {
  const { theme } = useTheme();

  return (
    <Tabs
      tabBar={(props) => <ExpandableTabBar {...props} tabs={tabs} actions={actions} />}
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

export default TabDesign9;
