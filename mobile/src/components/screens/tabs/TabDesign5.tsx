import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import type { Icon as IconsaxIcon } from "iconsax-react-native";
import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
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
// Icons: iconsax-react-native, same as design 3. One field, not an
// icon/iconFocused pair: an iconsax component already draws either state via
// its own `variant` prop.
export interface TabConfig {
  /** Route file name inside `app/(tabs)`, without the extension. */
  name: string;
  /** Label shown only when this tab is active — inactive tabs draw icon only. */
  title: string;
  icon: IconsaxIcon;
  /** Count for the corner dot. Omit or pass 0 for none. */
  badge?: number;
}

/**
 * Bottom tab bar — design 5: only the active tab expands into an
 * accent-colored icon + tinted label, sitting inside its own lighter
 * capsule; every inactive tab collapses to a bare icon with no label and no
 * background. Docked full-width, not floating.
 *
 * Structurally different from designs 2–4, not just restyled: those all
 * `position: "absolute"` themselves over the screen and rely on the screen
 * reserving a clearance constant of bottom padding to not sit underneath
 * them. This one is a plain in-flow `View` — React Navigation docks a
 * `tabBar` this way by default unless it is pulled out of flow, so a screen
 * under this design needs no clearance constant at all; the navigator
 * already lays the screen out above it like any normal bottom bar.
 *
 * Only the top corners round — a full-width bar flush against the screen's
 * bottom and side edges has no visible bottom corners to round in the first
 * place, unlike designs 2–4's floating pill which is rounded on every side.
 *
 * No grabber/handle mark drawn in the safe-area padding: that line in the
 * reference is the system's own home-indicator area, which the OS renders
 * itself — not something this component should draw a stand-in for.
 *
 * Every colour here resolves from the theme, so the bar works in light mode
 * as well as dark. Note that this is NOT the same as swapping one palette for
 * another: a translucent white wash lifts a dark surface but vanishes on a
 * light one, and the pale end of an accent is legible on dark and invisible
 * on light — so the mode-dependent values below flip which *direction* they
 * push, not merely which colour they use.
 */

const TOP_RADIUS = 20;
const CONTENT_HEIGHT = 60;
const ICON_SIZE = 24;

/** Height of a tab's own capsule, and the radius that keeps it a stadium. */
const PILL_HEIGHT = CONTENT_HEIGHT - 12;
const PILL_RADIUS = PILL_HEIGHT / 2;

/**
 * Horizontal padding at each end of the animation. Collapsed padding is what
 * makes an inactive tab a comfortable square tap target around a bare icon
 * (`COLLAPSED_PAD * 2 + ICON_SIZE` = 32).
 */
const COLLAPSED_PAD = 4;
const EXPANDED_PAD_LEFT = 16;
const EXPANDED_PAD_RIGHT = 22;

/** Space between the icon and its label once fully expanded. */
const LABEL_GAP = 10;

/**
 * How long a tab takes to expand into its pill (and its neighbours to slide
 * over) when it becomes active.
 *
 * The icons genuinely do move: an inactive tab is a bare icon and an active
 * one is a pill wide enough for icon + label, so with five labelled tabs on a
 * phone there is not enough width to keep every icon pinned AND fit the widest
 * pill without it colliding with its neighbour. This eases that reflow rather
 * than snapping through it.
 *
 * Reanimated honours the OS "reduce motion" setting by default, so a viewer
 * who has asked for less movement still gets the end state with no travel.
 */
const TRANSITION_MS = 260;

/**
 * Fixed regardless of theme, unlike the rest of this bar — a notification
 * dot reads as the same kind of signal in every theme, the way `semantic.*`
 * in constants/themes.ts is deliberately mode/variant-independent too.
 */
const BADGE_COLOR = "#f0872b";
const BADGE_SIZE = 9;

interface TabItemProps {
  tab: TabConfig;
  focused: boolean;
  onPress: () => void;
  iconColor: string;
  activeIconColor: string;
  labelColor: string;
  capsuleColor: string;
}

/**
 * One tab, expanding and collapsing continuously.
 *
 * Everything that changes between states — the capsule's fill, its padding,
 * and the label's width — is derived from a single `progress` shared value,
 * so the tab passes through every intermediate size instead of snapping
 * between two of them. That is the whole point: an earlier version mounted
 * the label on focus and left `LinearTransition` to animate the resulting
 * reflow, which meant the text popped in at full width while the surrounding
 * capsule was still growing, and the neighbours jumped to their new positions
 * in a separate, unsynchronised animation.
 *
 * The label is always mounted, never conditionally rendered — its container
 * just animates to zero width and clips it. Mounting is what caused the jump.
 */
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
    // The initially-focused tab should already be expanded on first paint
    // rather than animating open from nothing as the bar appears.
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
    paddingRight:
      COLLAPSED_PAD + progress.value * (EXPANDED_PAD_RIGHT - COLLAPSED_PAD),
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ["rgba(0,0,0,0)", capsuleColor],
    ),
  }));

  const labelStyle = useAnimatedStyle(() => ({
    width: progress.value * labelWidth,
    marginLeft: progress.value * LABEL_GAP,
    opacity: progress.value,
  }));

  const badge = tab.badge ?? 0;
  const Icon = tab.icon;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={badge > 0 ? `${tab.title}, ${badge}` : tab.title}
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
        <View>
          <Icon
            size={ICON_SIZE}
            color={focused ? activeIconColor : iconColor}
            variant={focused ? "Bold" : "Linear"}
          />

          {badge > 0 && !focused ? (
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

        <Animated.View style={[{ overflow: "hidden" }, labelStyle]}>
          <Text
            numberOfLines={1}
            style={{ fontSize: 14, fontWeight: "600", color: labelColor }}
          >
            {tab.title}
          </Text>
        </Animated.View>

        {/*
          Measures the label's natural width so the animation has a real
          target to interpolate toward. Absolutely positioned and transparent
          so it is outside layout and invisible; the visible copy above is
          clipped to zero width when collapsed and so cannot be measured
          itself.
        */}
        <Text
          aria-hidden
          onLayout={(e) => setLabelWidth(e.nativeEvent.layout.width)}
          numberOfLines={1}
          style={{
            position: "absolute",
            opacity: 0,
            fontSize: 14,
            fontWeight: "600",
          }}
        >
          {tab.title}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

function DockedTabBar({
  state,
  navigation,
  tabs,
}: BottomTabBarProps & { tabs: TabConfig[] }) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // Both the rim along the top edge and the active capsule's fill are a wash
  // of the *opposite* extreme to the surface under them: white at low alpha
  // lifts a dark bar, black at low alpha recedes into a light one. Hardcoding
  // the white version made the capsule invisible and the rim a bright scar in
  // light mode.
  const rimColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
  const activeCapsule = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)";

  // `darker` is the natural "surface above the background" token and works on
  // dark, where it lands a clear step above `background.dark`. In light mode
  // the two are near-identical (the default variant is #FFFFFF against
  // #F5F5F5, ~4%) and the bar dissolves into the screen — and in some variants
  // `darker` is actually *lighter* than `dark`, so it separates the wrong way.
  // `accent` is reliably a full step from `background.dark` in every variant's
  // light palette, so the bar keeps a visible edge.
  const barColor = isDark ? theme.background.darker : theme.background.accent;

  return (
    <View
      style={{
        backgroundColor: barColor,
        borderTopLeftRadius: TOP_RADIUS,
        borderTopRightRadius: TOP_RADIUS,
        borderTopWidth: 1,
        borderTopColor: rimColor,
        paddingBottom: Math.max(insets.bottom, 10),
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          // Stretches the 5 items across the full bar width rather than
          // clustering them — this bar is edge-to-edge (design 5 is docked
          // full-width, not a floating pill), so the side space is real
          // width to use, not slack to collapse out.
          justifyContent: "space-between",
          height: CONTENT_HEIGHT,
          paddingHorizontal: 18,
        }}
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
              // The accent's light/dark end swaps with the mode: `light` is a
              // pale tint that all but disappears against a light surface,
              // `dark` is the legible one there and too dim on a dark bar.
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
    </View>
  );
}

export function TabDesign5({ tabs }: { tabs: TabConfig[] }) {
  const { theme } = useTheme();

  return (
    <Tabs
      tabBar={(props) => <DockedTabBar {...props} tabs={tabs} />}
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

export default TabDesign5;
