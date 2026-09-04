import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import type { ComponentType } from "react";
import { Platform, Pressable, Text, View, type ViewStyle } from "react-native";
import { Path, Svg } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../../../contexts/ThemeContext";

// Deliberately redeclared per design rather than shared: each TabDesign* file
// stands alone, so deleting the ones a project doesn't use leaves nothing
// dangling behind them.
//
// Icons: the pixelarticons set (iconify.design/icon-sets/pixelarticons) —
// none of the bundled fonts have this 8-bit pixel-art look, and it is
// MIT-licensed rather than FontAwesome's paid Pro tier, which is where this
// design's icons started from as a request. Pulled as raw path data below
// rather than the full `@iconify-json/pixelarticons` package (500+ icons) —
// this design uses exactly four. Single style per glyph, not an
// icon/iconFocused pair or an iconsax-style `variant` prop: pixelarticons has
// no separate "active" drawing for these four icons, so active vs. inactive
// is colour only.
//
// No `center` field here — unlike design 3, every entry in this design is a
// plain column; nothing is promoted to a raised action.
export type IconComponent = ComponentType<{ size: number; color: string }>;

export interface TabConfig {
  /** Route file name inside `app/(tabs)`, without the extension. */
  name: string;
  /** Label under the icon. Always visible, active or not. */
  title: string;
  icon: IconComponent;
  /** Count for the corner dot. Omit or pass 0 for none. */
  badge?: number;
}

export function PixelHome({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fill={color}
        d="M4 20h16v2H4zm16-10h2v10h-2zM2 10h2v10H2zm2-2h2v2H4zm2-2h2v2H6zm2-2h2v2H8zm2-2h4v2h-4zm4 2h2v2h-2zm2 2h2v2h-2zm2 2h2v2h-2zM8 14h2v6H8zm2-2h4v2h-4zm4 2h2v6h-2z"
      />
    </Svg>
  );
}

export function PixelMessage({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fill={color}
        d="M20 2H4v2h16zm0 14H6v2h14zm2-12h-2v12h2zM4 4H2v18h2zm2 14H4v2h2z"
      />
    </Svg>
  );
}

export function PixelBell({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fill={color}
        d="M9 2h6v2H9zM7 4h2v2H7zm8 0h2v2h-2zM5 6h2v7H5zm12 0h2v7h-2zM3 13h2v4H3zm16 0h2v4h-2z"
      />
      <Path fill={color} d="M3 15h18v2H3zm5 3h2v2H8zm6 0h2v2h-2zm-4 2h4v2h-4z" />
    </Svg>
  );
}

export function PixelUser({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fill={color}
        d="M9 2h6v2H9zm0 8h6v2H9zm6-6h2v6h-2zM7 4h2v6H7zM4 18h2v4H4zm14 0h2v4h-2zM8 14h8v2H8zm-2 2h2v2H6zm10 0h2v2h-2z"
      />
    </Svg>
  );
}

/**
 * Bottom tab bar — design 4: a frosted glass pill, icon + label per column,
 * where the active column sits on its own translucent capsule that pokes
 * slightly above and below the bar's own edges — a "raised chip" rather than
 * a flush highlight.
 *
 * The glass comes from two stacked `BlurView`s: the bar itself (dark tint,
 * moderate blur) and, only under the active column, a second, lighter one
 * for the capsule — real backdrop blur rather than a flat translucent color,
 * so it reads as glass over whatever scrolls underneath rather than as a
 * tinted box.
 *
 * Floats over content like designs 2 and 3: a screen rendered inside it must
 * reserve `TAB_BAR_CLEARANCE` of bottom padding.
 *
 * `expo-blur`'s blur is native on iOS out of the box, including in Expo Go.
 * On Android real blur needs `experimentalBlurMethod="dimezisBlurView"` (set
 * below) — but that method is backed by a native module this package ships
 * only as source, not by anything present in Expo Go's precompiled binary.
 * It renders on Android ONLY after `expo prebuild` + a custom dev client (or
 * `expo run:android`); inside plain Expo Go on Android it silently falls back
 * to a flat translucent fill, indistinguishable from no blur at all.
 *
 * Separately, on any platform: blur only has something to distort when the
 * content behind the bar has visual variation — an image, a gradient, a busy
 * layout. Over a flat single-color screen (this repo's Themes screen, for
 * instance) a perfectly-working blur produces the exact same flat color, so
 * it will look identical to no blur even where the native effect is real.
 */

/** Height of the bar itself, before safe-area insets. */
export const TAB_BAR_HEIGHT = 68;

/**
 * How far the active capsule's raised top/bottom edges reach past the bar's
 * own edges — the detail that makes it read as "popped up" rather than just
 * a highlighted column.
 */
const CAPSULE_OVERHANG = 8;

/** Bottom padding a screen needs so its content clears the floating bar. */
export const TAB_BAR_CLEARANCE = TAB_BAR_HEIGHT + CAPSULE_OVERHANG + 24;

const GUTTER = 16;
const MIN_BOTTOM_GAP = 12;
const BAR_RADIUS = 30;
const ICON_SIZE = 22;

const BADGE_COLOR = "#f0872b";
const BADGE_SIZE = 9;

/** Active label/icon: near-white. Inactive: dimmed, same base color. */
const ACTIVE_COLOR = "#ffffff";
const INACTIVE_COLOR = "rgba(255,255,255,0.5)";

/**
 * Rim light along the bar's top edge — the thin bright line a sheet of glass
 * catches along its top under light from above. A solid fill would look flat;
 * a border alone (no blur) reads as a plain dark rounded rectangle.
 */
const RIM_BORDER: ViewStyle = {
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.14)",
};

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

function GlassTabBar({
  state,
  navigation,
  tabs,
}: BottomTabBarProps & { tabs: TabConfig[] }) {
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
        // Room for the active capsule's overhang above/below the bar, so it
        // never clips against this container's own edges.
        paddingTop: CAPSULE_OVERHANG,
      }}
      // Lets taps fall through the padding around the bar to the content
      // underneath, which is otherwise covered by this full-width container.
      pointerEvents="box-none"
    >
      {/* Shadow lives on this outer wrapper, not the `BlurView` below: a
          view with `overflow: "hidden"` (needed there for the blur's own
          rounded-corner clip) also clips away its own shadow on iOS —
          `clipsToBounds` removes anything outside the layer's bounds,
          shadow included. Splitting the two into separate layers is the
          standard RN workaround. */}
      <View style={[{ borderRadius: BAR_RADIUS }, SHADOW]}>
        <BlurView
          intensity={75}
          tint="dark"
          experimentalBlurMethod="dimezisBlurView"
          style={[
            {
              flexDirection: "row",
              alignItems: "center",
              height: TAB_BAR_HEIGHT,
              borderRadius: BAR_RADIUS,
              overflow: "hidden",
              // Kept faint on purpose: this used to sit at 0.55 alpha, which is
              // opaque enough on its own to read as "a dark box" and swallow
              // whatever the blur underneath contributes. `tint`+`intensity`
              // above are what should carry the look; this is only a floor so
              // the bar still reads as a bar over a light or blur-less (see the
              // note above) background.
              backgroundColor: "rgba(20,20,22,0.2)",
            },
            RIM_BORDER,
          ]}
        >
          {state.routes.map((route, index) => {
            // Driven by the navigator's own route list, so a route with no entry
            // in `tabs` simply isn't drawn instead of rendering a blank column.
            const tab = tabs.find((t) => t.name === route.name);
            if (!tab) return null;

            const focused = state.index === index;
            const badge = tab.badge ?? 0;
            const Icon = tab.icon;
            const color = focused ? ACTIVE_COLOR : INACTIVE_COLOR;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={
                  badge > 0 ? `${tab.title}, ${badge}` : tab.title
                }
                style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
              >
                {focused ? (
                  <BlurView
                    intensity={90}
                    tint="dark"
                    experimentalBlurMethod="dimezisBlurView"
                    style={{
                      position: "absolute",
                      top: -CAPSULE_OVERHANG,
                      bottom: -CAPSULE_OVERHANG,
                      left: 4,
                      right: 4,
                      borderRadius: BAR_RADIUS,
                      overflow: "hidden",
                      // Darker than the bar around it, not lighter — the
                      // reference's active capsule reads as a deeper well, not
                      // a highlight. A light tint here was backwards.
                      backgroundColor: "rgba(0,0,0,0.35)",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.12)",
                    }}
                  />
                ) : null}

                <View style={{ alignItems: "center", gap: 4 }}>
                  <View>
                    <Icon size={ICON_SIZE} color={color} />

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

                  <Text style={{ fontSize: 11, fontWeight: "600", color }} numberOfLines={1}>
                    {tab.title}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </BlurView>
      </View>
    </View>
  );
}

export function TabDesign4({ tabs }: { tabs: TabConfig[] }) {
  const { theme } = useTheme();

  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...props} tabs={tabs} />}
      screenOptions={{
        headerShown: false,
        // Screen content still follows the app's light/dark mode — only the
        // bar itself is a fixed dark glass regardless of theme, same as the
        // reference: a dark floating dock reads as glass because there is
        // something dark to blur, and would wash out over a light scene.
        sceneStyle: { backgroundColor: theme.background.dark },
      }}
    >
      {tabs.map(({ name, title }) => (
        <Tabs.Screen key={name} name={name} options={{ title }} />
      ))}
    </Tabs>
  );
}

export default TabDesign4;
