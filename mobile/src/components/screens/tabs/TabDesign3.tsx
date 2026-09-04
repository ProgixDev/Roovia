import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import type { Icon as IconsaxIcon } from "iconsax-react-native";
import { Platform, Pressable, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../../../contexts/ThemeContext";

// Deliberately redeclared per design rather than shared: each TabDesign* file
// stands alone, so deleting the ones a project doesn't use leaves nothing
// dangling behind them. `center` is the one field only this design reads.
//
// Icons come from `iconsax-react-native` (MIT-licensed, needs only the
// already-installed `react-native-svg` peer dep) rather than a
// MaterialCommunityIcons glyph — none of the bundled icon fonts have this
// bar's rounded, uniform-stroke look or a face-in-a-bubble chat glyph.
//
// One field, not the `icon`/`iconFocused` pair the other designs use: an
// iconsax component already draws either state itself via its own `variant`
// prop ('Linear' | 'Bold' | …), so a second field would just be the same
// component reference typed twice for no reason.
export interface TabConfig {
  /** Route file name inside `app/(tabs)`, without the extension. */
  name: string;
  /** Accessible name. This design draws no labels, so it is never shown. */
  title: string;
  icon: IconsaxIcon;
  /** Count for the corner dot. Omit or pass 0 for none. */
  badge?: number;
  /**
   * Draws this entry as the raised circular action in the middle of the bar
   * instead of a plain column. Intended for exactly one entry, ideally the
   * middle one — the bar still renders correctly with none.
   */
  center?: boolean;
}

/**
 * Bottom tab bar — design 3: a floating pill with no labels, where the active
 * entry sits on a rounded chip inset from the bar's edges, and one entry is
 * promoted to a filled circular action in the middle.
 *
 * Like design 2 this bar floats over the content, so a screen inside it must
 * reserve `TAB_BAR_CLEARANCE` of bottom padding.
 *
 * Every entry reserves the same `CHIP_SIZE` box whether or not it is drawing
 * a chip, so the row of icons stays evenly spaced instead of shifting as the
 * active one gains a background.
 */

/** Height of the pill itself, before safe-area insets. */
export const TAB_BAR_HEIGHT = 72;

/** Bottom padding a screen needs so its content clears the floating bar. */
export const TAB_BAR_CLEARANCE = TAB_BAR_HEIGHT + 24;

const GUTTER = 16;
const MIN_BOTTOM_GAP = 12;
const PILL_RADIUS = 32;
const ICON_SIZE = 24;

/**
 * The box every entry occupies: the active chip, the middle action's circle,
 * and the plain columns that draw neither.
 */
const CHIP_SIZE = 52;

/**
 * Corner radius of the active chip. Just short of `CHIP_SIZE / 2` — round
 * enough to read as a soft blob rather than a rounded square, while the few
 * points it keeps off a full circle are what still tell it apart from the
 * middle action beside it.
 */
const ACTIVE_RADIUS = 22;

/**
 * Fill behind the active chip: the theme's primary at ~15%.
 *
 * An 8-digit #RRGGBBAA literal, which every theme variant here supports
 * because each defines `primary.main` as a 6-digit hex.
 */
const ACTIVE_TINT_ALPHA = "26";

/** Corner dot. Warm on purpose, so it separates from the primary accent. */
const BADGE_COLOR = "#f0872b";
const BADGE_SIZE = 10;

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

function PillTabBar({
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
            borderRadius: PILL_RADIUS,
            backgroundColor: theme.background.darker,
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
          const badge = tab.badge ?? 0;

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

          const iconColor = tab.center
            ? theme.background.darker
            : focused
              ? theme.primary.main
              : theme.foreground.gray;
          const Icon = tab.icon;

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={
                badge > 0 ? `${tab.title}, ${badge}` : tab.title
              }
              style={({ pressed }) => ({
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <View
                style={{
                  width: CHIP_SIZE,
                  height: CHIP_SIZE,
                  alignItems: "center",
                  justifyContent: "center",
                  // Circle for the middle action, squircle for the active
                  // chip. The inactive case still reserves the box so the
                  // icons do not shift when the chip appears behind one.
                  borderRadius: tab.center ? CHIP_SIZE / 2 : ACTIVE_RADIUS,
                  backgroundColor: tab.center
                    ? theme.primary.main
                    : focused
                      ? theme.primary.main + ACTIVE_TINT_ALPHA
                      : "transparent",
                  // Android-only bug workaround: a View whose borderRadius
                  // stays fixed while only its backgroundColor changes across
                  // renders (exactly what happens here on every tab switch)
                  // can keep the corner clip from its FIRST paint and square
                  // off on repaint. `overflow: "hidden"` forces Android to
                  // recompute the clip on every render instead of reusing it.
                  overflow: "hidden",
                }}
              >
                {/* Wraps the glyph alone so the badge anchors to the icon's
                    own corner rather than the much larger chip's. */}
                <View>
                  <Icon
                    size={ICON_SIZE}
                    color={iconColor}
                    // The center action keeps its bare Linear glyph even
                    // when "focused": several iconsax Bold glyphs draw their
                    // own frame or fill (a rounded square, filled dots),
                    // which would double up with the circle this button
                    // already sits on.
                    variant={!tab.center && focused ? "Bold" : "Linear"}
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
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function TabDesign3({ tabs }: { tabs: TabConfig[] }) {
  const { theme } = useTheme();

  return (
    <Tabs
      tabBar={(props) => <PillTabBar {...props} tabs={tabs} />}
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

export default TabDesign3;
