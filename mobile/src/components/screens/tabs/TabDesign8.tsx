import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import type { ComponentType } from "react";
import { useEffect, useRef, useState } from "react";
import { Platform, Pressable, Text, View, type ViewStyle } from "react-native";
import { Path, Svg } from "react-native-svg";
import Animated, {
  Easing,
  interpolateColor,
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
// Icons: hand-picked glyphs from the Iconly Essential set (the free tier —
// react-native-iconly on npm wraps it under MIT; the paid "Iconly Pro" tier
// is a separate, unrelated product this does NOT touch), pulled as raw path
// data below rather than installing that package — its peer deps (React
// ^16/17, react-native-svg ^12) predate this project's stack (React 19,
// react-native-svg 15) and it hasn't been updated to match, so vendoring
// just the four icons actually used avoids dragging in a stale dependency
// for something this small. `*Light`/`*Bold` pairs, one component per glyph
// per state — same shape as the icon/iconFocused pairs designs 1–3 use.
export type IconComponent = ComponentType<{ size: number; color: string }>;

export interface TabConfig {
  /** Route file name inside `app/(tabs)`, without the extension. */
  name: string;
  /** Label shown only when this tab is active — inactive tabs draw icon only. */
  title: string;
  icon: IconComponent;
  iconFocused: IconComponent;
}

export function HomeLight({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6.657,18.771V15.7a1.426,1.426,0,0,1,1.424-1.419h2.886A1.426,1.426,0,0,1,12.4,15.7h0v3.076A1.225,1.225,0,0,0,13.6,20h1.924A3.456,3.456,0,0,0,19,16.562h0V7.838a2.439,2.439,0,0,0-.962-1.9L11.458.685a3.18,3.18,0,0,0-3.944,0L.962,5.943A2.42,2.42,0,0,0,0,7.847v8.714A3.456,3.456,0,0,0,3.473,20H5.4a1.235,1.235,0,0,0,1.241-1.229h0"
        transform="translate(2.5 2)"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function HomeBold({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6.635,18.773V15.716A1.419,1.419,0,0,1,8.058,14.3h2.874a1.429,1.429,0,0,1,1.007.414,1.408,1.408,0,0,1,.417,1v3.058a1.213,1.213,0,0,0,.356.867,1.231,1.231,0,0,0,.871.36h1.961a3.46,3.46,0,0,0,2.443-1A3.41,3.41,0,0,0,19,16.578V7.867a2.473,2.473,0,0,0-.9-1.9L11.434.676A3.1,3.1,0,0,0,7.485.747L.967,5.965A2.474,2.474,0,0,0,0,7.867v8.7A3.444,3.444,0,0,0,3.456,20H5.372a1.231,1.231,0,0,0,1.236-1.218Z"
        transform="translate(2.5 2)"
        fill={color}
      />
    </Svg>
  );
}

// "Document" — closest Iconly has to a literal checklist glyph for the tasks
// tab (searched for a dedicated check-list/task icon in the set; none
// exists). Its Light variant draws three stacked lines inside a rounded
// rect, which reads close enough to a task list at this size.
export function TasksLight({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M7.22.5H0" transform="translate(8.496 15.723)" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7.22.5H0" transform="translate(8.496 11.537)" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M2.755.5H0" transform="translate(8.496 7.36)" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path
        d="M12.158,0,4.469,0A4.251,4.251,0,0,0,0,4.607v9.2A4.254,4.254,0,0,0,4.506,18.41l7.689,0a4.252,4.252,0,0,0,4.47-4.6v-9.2A4.255,4.255,0,0,0,12.158,0Z"
        transform="translate(3.751 2.75)"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function TasksBold({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M13.191,20H4.81C1.753,20,0,18.236,0,15.16V4.83A4.91,4.91,0,0,1,1.265,1.271,4.863,4.863,0,0,1,4.81,0h8.382C16.247,0,18,1.761,18,4.83V15.16a4.891,4.891,0,0,1-1.246,3.583A4.819,4.819,0,0,1,13.191,20ZM5,13.736a.78.78,0,0,0-.668.374.786.786,0,0,0,.653,1.206.7.7,0,0,0,.1-.006H12.92a.79.79,0,0,0,0-1.57H5.08A.8.8,0,0,0,5,13.736ZM5.08,9.179a.78.78,0,0,0,0,1.561H12.92a.78.78,0,0,0,0-1.561Zm0-4.529v.01h0a.779.779,0,0,0,0,1.559h2.99a.785.785,0,0,0,0-1.57Z"
        transform="translate(3 2)"
        fill={color}
      />
    </Svg>
  );
}

export function FolderLight({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19.169,13.482c0,3.578-2.109,5.687-5.687,5.687H5.7c-3.587,0-5.7-2.109-5.7-5.687v-7.8C0,2.109,1.314,0,4.893,0h2A2.282,2.282,0,0,1,8.717.913L9.63,2.127a2.291,2.291,0,0,0,1.826.913h2.83c3.587,0,4.911,1.826,4.911,5.477Z"
        transform="translate(2.276 2.276)"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M0,.456H9.593" transform="translate(7.059 14.033)" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function FolderBold({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M13.75,20H6.24C2.391,20,0,17.606,0,13.75V6.241C0,2.1,1.84,0,5.47,0H7.081A2.956,2.956,0,0,1,9.42,1.15L10.3,2.32a1.472,1.472,0,0,0,1.15.56h3.07a5.446,5.446,0,0,1,4,1.361A6.36,6.36,0,0,1,20,8.89v4.87a6.278,6.278,0,0,1-1.674,4.568A6.3,6.3,0,0,1,13.75,20ZM5.37,11.79a.743.743,0,0,0-.751.751.751.751,0,0,0,.751.75h9.26a.746.746,0,0,0,.74-.75.737.737,0,0,0-.74-.751Z"
        transform="translate(2 2)"
        fill={color}
      />
    </Svg>
  );
}

export function ChatLight({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.085,1.166a1.169,1.169,0,1,1,1.169,1.169A1.169,1.169,0,0,1,9.085,1.166Zm-4.542,0A1.168,1.168,0,1,1,5.711,2.336,1.169,1.169,0,0,1,4.543,1.166ZM0,1.166A1.169,1.169,0,1,1,1.168,2.336,1.169,1.169,0,0,1,0,1.166Z"
        transform="translate(6.527 11.056)"
        fill={color}
      />
      <Path
        d="M10.02,0A10.006,10.006,0,0,0,0,10.015a10.584,10.584,0,0,0,1.35,5,1.051,1.051,0,0,1,.07.9L.75,18.157a.624.624,0,0,0,.82.78l2.02-.6a1.7,1.7,0,0,1,1.49.361A10,10,0,1,0,10.02,0Z"
        transform="translate(2 2)"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChatBold({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M10,20a9.955,9.955,0,0,1-4.92-1.3,2.2,2.2,0,0,0-1.107-.424,1.213,1.213,0,0,0-.383.063l-2.02.6a.754.754,0,0,1-.226.036.62.62,0,0,1-.5-.239.647.647,0,0,1-.094-.578l.67-2.244a1.046,1.046,0,0,0-.07-.9,10.566,10.566,0,0,1-1.35-5A10.158,10.158,0,0,1,2.831,3.032,9.89,9.89,0,0,1,10.02,0a9.865,9.865,0,0,1,7.12,2.994,10.058,10.058,0,0,1,2.1,3.182A9.89,9.89,0,0,1,20,9.985a10.138,10.138,0,0,1-.865,4.172,9.6,9.6,0,0,1-2.275,3.153A10.245,10.245,0,0,1,10,20ZM14.59,8.743a1.282,1.282,0,1,0,1.28,1.282A1.282,1.282,0,0,0,14.59,8.743Zm-4.629,0A1.268,1.268,0,0,0,8.7,10.015,1.28,1.28,0,1,0,9.98,8.743H9.961Zm-4.591,0a1.282,1.282,0,1,0,1.28,1.282A1.283,1.283,0,0,0,5.37,8.743Z"
        transform="translate(2 2)"
        fill={color}
      />
    </Svg>
  );
}

/**
 * Bare plus, no enclosing frame — Iconly's own "Plus" icon draws the cross
 * INSIDE a rounded-square border baked into the same path, which would
 * double up with the circle the FAB itself already sits on (the same clash
 * a self-framed icon caused on design 3's center action). This is only the
 * cross, lifted out of Iconly's Light "Plus" as its two straight-line paths
 * with the third (frame) path dropped.
 */
function PlusIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M.476,0V7.326" transform="translate(11.524 8.327)" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7.333.476H0" transform="translate(8.333 11.515)" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/**
 * Bottom tab bar — design 8: a floating pill where only the active tab
 * expands into icon + label inside its own capsule (identical animation
 * model to design 5's `TabItem` — a single `progress` value drives capsule
 * padding, fill, and label width together, so it passes through every
 * intermediate size instead of snapping), plus a separate circular FAB
 * riding beside the pill for a "create" action.
 *
 * Floats over content like designs 2–4: a screen rendered inside it must
 * reserve `TAB_BAR_CLEARANCE` of bottom padding.
 *
 * The FAB is visual only — this template has no "create" flow to send it
 * to, so its `onPress` is left unset rather than wired to a fake action.
 * Give it one when a project has something for it to do.
 */

const CONTENT_HEIGHT = 64;
const BAR_RADIUS = CONTENT_HEIGHT / 2;
const ICON_SIZE = 22;

/** Height of a tab's own capsule, and the radius that keeps it a stadium. */
const PILL_HEIGHT = CONTENT_HEIGHT - 14;
const PILL_RADIUS = PILL_HEIGHT / 2;

const COLLAPSED_PAD = 10;
const EXPANDED_PAD_LEFT = 14;
const EXPANDED_PAD_RIGHT = 18;
const LABEL_GAP = 8;
const TRANSITION_MS = 260;

const GUTTER = 16;
const MIN_BOTTOM_GAP = 12;
/** Space between the pill bar and the FAB. */
const FAB_GAP = 12;
const FAB_SIZE = CONTENT_HEIGHT;

/** Bottom padding a screen needs so its content clears the floating bar. */
export const TAB_BAR_CLEARANCE = CONTENT_HEIGHT + 24;

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

interface TabItemProps {
  tab: TabConfig;
  focused: boolean;
  onPress: () => void;
  iconColor: string;
  activeIconColor: string;
  labelColor: string;
  capsuleColor: string;
}

/** Same expand/collapse model as design 5's `TabItem` — see that file for the reasoning behind driving padding, fill, and label width off one shared `progress` value instead of two mounted states. */
function TabItem({
  tab,
  focused,
  onPress,
  iconColor,
  activeIconColor,
  labelColor,
  capsuleColor,
}: TabItemProps) {
  const progress = useSharedValue(focused ? 1 : 0);
  const [labelWidth, setLabelWidth] = useState(0);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      progress.value = focused ? 1 : 0;
      return;
    }

    progress.value = withTiming(focused ? 1 : 0, {
      duration: TRANSITION_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [focused, progress]);

  const capsuleStyle = useAnimatedStyle(() => ({
    paddingLeft: COLLAPSED_PAD + progress.value * (EXPANDED_PAD_LEFT - COLLAPSED_PAD),
    paddingRight: COLLAPSED_PAD + progress.value * (EXPANDED_PAD_RIGHT - COLLAPSED_PAD),
    backgroundColor: interpolateColor(progress.value, [0, 1], ["rgba(0,0,0,0)", capsuleColor]),
  }));

  const labelStyle = useAnimatedStyle(() => ({
    width: progress.value * labelWidth,
    marginLeft: progress.value * LABEL_GAP,
    opacity: progress.value,
  }));

  const Icon = focused ? tab.iconFocused : tab.icon;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={tab.title}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <Animated.View
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            height: PILL_HEIGHT,
            borderRadius: PILL_RADIUS,
          },
          capsuleStyle,
        ]}
      >
        <Icon size={ICON_SIZE} color={focused ? activeIconColor : iconColor} />

        <Animated.View style={[{ overflow: "hidden" }, labelStyle]}>
          <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "600", color: labelColor }}>
            {tab.title}
          </Text>
        </Animated.View>

        {/* Measures the label's natural width so the animation has a real
            target — see design 5's identical comment for why this can't
            just measure the visible copy above (it's clipped to 0 width
            when collapsed). */}
        <Text
          aria-hidden
          onLayout={(e) => setLabelWidth(e.nativeEvent.layout.width)}
          numberOfLines={1}
          style={{ position: "absolute", opacity: 0, fontSize: 13, fontWeight: "600" }}
        >
          {tab.title}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

function FloatingTabBar({
  state,
  navigation,
  tabs,
}: BottomTabBarProps & { tabs: TabConfig[] }) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // Same reasoning as design 5's identically-named values: the wash and the
  // FAB's icon both need to flip which extreme they push toward depending on
  // mode, not just swap one fixed colour for another.
  const activeCapsule = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)";
  const barColor = isDark ? theme.background.darker : theme.background.accent;

  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingBottom: Math.max(insets.bottom, MIN_BOTTOM_GAP),
        paddingHorizontal: GUTTER,
        flexDirection: "row",
        alignItems: "center",
      }}
      pointerEvents="box-none"
    >
      <View
        style={[
          {
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-evenly",
            height: CONTENT_HEIGHT,
            borderRadius: BAR_RADIUS,
            backgroundColor: barColor,
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

          return (
            <TabItem
              key={route.key}
              tab={tab}
              focused={focused}
              iconColor={theme.foreground.gray}
              activeIconColor={isDark ? theme.primary.main : theme.primary.dark}
              labelColor={isDark ? theme.primary.light : theme.primary.dark}
              capsuleColor={activeCapsule}
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
            />
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Create"
        style={({ pressed }) => [
          {
            marginLeft: FAB_GAP,
            width: FAB_SIZE,
            height: FAB_SIZE,
            borderRadius: FAB_SIZE / 2,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.primary.main,
            opacity: pressed ? 0.85 : 1,
          },
          SHADOW,
        ]}
      >
        {/* Dark icon on the accent fill, not white: `primary.main` is a
            bright, light-toned colour in every variant here (see
            constants/themes.ts), so a white glyph on top of it would be
            low-contrast. `background.darker` is design 3's center-action
            button making the same call for the same reason. */}
        <PlusIcon size={24} color={theme.background.darker} />
      </Pressable>
    </View>
  );
}

export function TabDesign8({ tabs }: { tabs: TabConfig[] }) {
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

export default TabDesign8;
