import {
  BottomTabBarHeightCallbackContext,
  type BottomTabBarProps,
} from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import type { Icon as IconsaxIcon } from "iconsax-react-native";
import { useCallback, useContext, useEffect } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../../../contexts/ThemeContext";

// Deliberately redeclared per design rather than shared: each TabDesign* file
// stands alone, so deleting the ones a project doesn't use leaves nothing
// dangling behind them.
export interface TabConfig {
  /** Route file name inside `app/(tabs)`, without the extension. */
  name: string;
  /** Label under the icon, below the ring — always visible, active or not. */
  title: string;
  icon: IconsaxIcon;
}

/**
 * Bottom tab bar — design 6 ("ARC"): a glowing point that lives on the
 * active tab as a ring, and becomes a straight rod with a light sliding
 * along it whenever the selection is moving between two tabs — by drag or
 * by tap. There is deliberately no third shape: the rod is always straight
 * and always spans two real tab positions, never a curve, never an end left
 * floating between them.
 *
 * ## The model
 *
 * Two points drive everything, `head` and `tail`, each an (x, velocity)
 * pair simulated with `useFrameCallback` as an explicit Euler-integrated
 * spring — not `withSpring`, because the two points need different,
 * *time-varying* stiffness, which a single declarative spring call can't
 * express:
 *
 * - `head` chases the destination tab with fixed constants. It is normally
 *   the point closest to done, so a plain critically-damped spring is
 *   enough.
 * - `tail` chases the SAME destination but starts from wherever the
 *   selection is departing, which on a fast drag across the whole bar can
 *   be a long way off. Its stiffness ramps up as ITS OWN remaining distance
 *   (normalized by its own total trip) shrinks — soft while there is
 *   ground left to cover, stiff only once it is nearly there. That is what
 *   makes the tail read as a sweep that eases in and then snaps taut,
 *   rather than a linear slide or a wobble.
 *
 * `head` and `tail` colliding (within `SETTLE_EPSILON`) is what "arrived"
 * MEANS here — there is no separate boolean; the rod's length is the
 * animation's own progress value. A ring rides on `head` (the part your
 * finger or the tap is driving) throughout — apart, it trails a rod back to
 * `tail`; together, the rod has nothing left to show and only the ring
 * remains.
 *
 * Dragging pins `tail` to the tab nearest the drag's start (usually the
 * previously-active one) and drives `head` 1:1 with the finger — no spring
 * while a finger is down, so it never fights the touch. Only on release
 * does `head` start springing the rest of the way, `tail` re-anchors to
 * whichever tab is now nearest, and the same two-spring settle plays. A
 * plain tap reuses the identical settle path: it's a "drag" whose finger
 * released immediately at the target with no travel of its own.
 *
 * ## What I could not verify
 *
 * All of this runs from a written description and a code screenshot, not a
 * running reference — I have no device to preview the feel on. The spring
 * constants below (`HEAD_*`, `TAIL_*`) are reasoned defaults, not measured
 * ones, and are the first place to tune if the settle feels too slow, too
 * snappy, or overshoots.
 */

/**
 * Height of the ICON ROW only — the top slice that holds the ring/rod/light
 * and the icons themselves. `rowCenterY` (below) is half of this, and the
 * ring/rod/light are all positioned against that.
 */
export const TAB_BAR_HEIGHT = 64;

/** Extra height below the icon row that the label occupies. */
const LABEL_AREA_HEIGHT = 20;

/**
 * Breathing room below the label, before the safe-area inset — same role as
 * design 1's `spacing.sm` in its own `paddingBottom: insets.bottom + spacing.sm`.
 */
const BOTTOM_PADDING = 8;

const ICON_SIZE = 22;
const LABEL_FONT_SIZE = 11;
/** Clearance between the ring's bottom edge and the label, in px. */
const LABEL_GAP = 4;
/**
 * Docked full-width like design 1, not a floating inset pill: only the top
 * edge gets a border, so there is no side border to account for in the
 * column-center math below — the content box IS the bar's own width.
 */
const BORDER_TOP_WIDTH = 1;

/** Rod/ring collapse threshold, in px — below this the two points render as one ring. */
const SETTLE_EPSILON = 1.5;
/** Below this combined speed (px/s) the settle is considered fully at rest. */
const SETTLE_VELOCITY_EPSILON = 4;

/** `head`'s fixed spring — see the class doc. Slightly under-damped on purpose: a hair of overshoot reads as "light", not sluggish. */
const HEAD_STIFFNESS = 235;
const HEAD_DAMPING = 22;

/**
 * `tail`'s stiffness ramps between these across its own trip, softest end
 * first. ~2.5x the original tuning (damping ~1.58x, √2.5, to hold the same
 * damping ratio — same character, not bouncier): `head` reaching the
 * destination was never the slow part, `tail` sweeping in from the OLD tab
 * was — the rod/light stay visible, and the ring can't appear, until `tail`
 * closes that gap. This is the constant that actually controls how long
 * that wait is.
 */
const TAIL_STIFFNESS_MIN = 155;
const TAIL_STIFFNESS_MAX = 550;
/** `tail`'s damping ramps alongside stiffness so it doesn't ring as it stiffens. */
const TAIL_DAMPING_MIN = 22;
const TAIL_DAMPING_MAX = 54;

/** Radius of the ring that rides on `head`, resting or dragging. */
const RING_RADIUS = 19;

/**
 * Pulls the label up out of the icon row's full `TAB_BAR_HEIGHT`, which is
 * sized for `rowCenterY` alignment (see the icon box's own comment below),
 * not for how close a label should sit — left alone, that reserved height
 * put a bare label about 20px below the ring's actual edge. Derived from
 * the same constants the ring itself uses, so it stays correct if
 * `RING_RADIUS` or `TAB_BAR_HEIGHT` ever change.
 */
const LABEL_MARGIN_TOP = TAB_BAR_HEIGHT / 2 + RING_RADIUS + LABEL_GAP - TAB_BAR_HEIGHT;
/** Rod thickness scales with speed — a moving line reads dimmer at constant weight, so weight compensates. */
const ROD_BASE_WIDTH = 2;
const ROD_SPEED_WIDTH = 0.006;
const ROD_MAX_WIDTH = 5;

const INACTIVE_ICON_COLOR_LIGHT = "rgba(0,0,0,0.55)";
const INACTIVE_ICON_COLOR_DARK = "rgba(255,255,255,0.55)";

/** Clamp, worklet-safe (Reanimated's UI thread has no Math import from RN). */
function clamp(value: number, min: number, max: number) {
  "worklet";
  return Math.min(Math.max(value, min), max);
}

const easeOut = Easing.out(Easing.cubic);

function GlassArcBar({
  state,
  navigation,
  tabs,
}: BottomTabBarProps & { tabs: TabConfig[] }) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const onHeightChange = useContext(BottomTabBarHeightCallbackContext);

  const columns = state.routes
    .map((route, routeIndex) => ({
      route,
      routeIndex,
      tab: tabs.find((t) => t.name === route.name),
    }))
    .filter((c): c is typeof c & { tab: TabConfig } => Boolean(c.tab));

  // ONE measurement of the bar, and every column center derived from it by
  // arithmetic — every column is `flex: 1`, so center(i) is exactly
  // `innerWidth * (i + 0.5) / count`.
  //
  // This deliberately replaced a per-column `onLayout` that accumulated
  // centers into a shared-value array. That could not work: writes to a
  // shared value are applied asynchronously on the JS thread (per the
  // Reanimated docs, reading `.value` right after writing it there still
  // returns the OLD value). All five column layouts land in one batch, so
  // each read the same stale `[0,0,0,0,0]`, and each write clobbered the
  // previous one — leaving four of five centers at 0. Tapping any of those
  // sent the ring to x=0, the bar's left edge, permanently.
  const barWidth = useSharedValue(0);
  const columnCount = columns.length;

  const activeIndex = columns.findIndex((c) => c.routeIndex === state.index);

  // The two simulated points. `tail` starts wherever `head` starts — before
  // the first layout both are 0, but the first `onPress`/drag will re-anchor
  // both to a real column center before anything is drawn from them.
  const head = useSharedValue(0);
  const headV = useSharedValue(0);
  const tail = useSharedValue(0);
  const tailV = useSharedValue(0);
  // `tail`'s own total trip for this settle, captured once when it starts —
  // its stiffness ramp is normalized against ITS distance, not `head`'s.
  const tailTrip = useSharedValue(1);
  const targetIndex = useSharedValue(activeIndex);

  // Drag-only state: while true, `head` follows the gesture 1:1 (no spring)
  // and `tail` stays pinned whereever the drag began.
  const dragging = useSharedValue(false);

  const settling = useSharedValue(false);

  const commitIndex = useCallback(
    (index: number) => {
      const target = columns[index];
      if (!target) return;
      if (target.routeIndex !== state.index) {
        const event = navigation.emit({
          type: "tabPress",
          target: target.route.key,
          canPreventDefault: true,
        });
        if (!event.defaultPrevented) {
          navigation.navigate(target.route.name);
        }
      }
    },
    [columns, navigation, state.index],
  );

  /**
   * Center of column `i`, in the bar's own coordinates. No border-inset
   * correction needed here (unlike the earlier floating pill): only the top
   * edge has a border, so the bar's measured width IS the columns' width.
   */
  const centerOf = useCallback(
    (index: number) => {
      "worklet";
      if (barWidth.value <= 0 || columnCount === 0) return 0;
      return (barWidth.value * (index + 0.5)) / columnCount;
    },
    [barWidth, columnCount],
  );

  const nearestIndexTo = useCallback(
    (x: number) => {
      "worklet";
      if (barWidth.value <= 0 || columnCount === 0) return 0;
      // Inverse of `centerOf`, rounded to the closest column.
      const raw = (x / barWidth.value) * columnCount - 0.5;
      return clamp(Math.round(raw), 0, columnCount - 1);
    },
    [barWidth, columnCount],
  );

  // Autostart and self-gate on `settling` (below) rather than toggling
  // `.setActive()` from the gesture worklets: `setActive` lives on the
  // object this hook returns, and a "worklet"-tagged function that closes
  // over that whole object triggers Reanimated's "modified a key of an
  // object already passed to a worklet" warning, because the object is also
  // mutated from the JS side (`isActive`, `callbackId`). Running every frame
  // and returning immediately when idle is cheap enough that there's no
  // reason to fight that.
  useFrameCallback((frameInfo) => {
    "worklet";
    if (!settling.value) return;

    // Nothing sensible to animate toward before the bar has been measured.
    if (barWidth.value <= 0) return;

    const dtMs = frameInfo.timeSincePreviousFrame ?? 16;
    // Clamped so a dropped-frame stall (backgrounding, a heavy JS burst)
    // can't fling the springs with one giant step.
    const h = clamp(dtMs, 0, 32) / 1000;
    const to = centerOf(targetIndex.value);

    // head: fixed critically-ish-damped spring toward `to`.
    const headAccel = -HEAD_STIFFNESS * (head.value - to) - HEAD_DAMPING * headV.value;
    headV.value += headAccel * h;
    head.value += headV.value * h;

    // tail: stiffness/damping ramp with ITS OWN remaining-trip fraction.
    const remaining = Math.abs(tail.value - to);
    const progress = 1 - easeOut(clamp(remaining / tailTrip.value, 0, 1));
    const kTail = TAIL_STIFFNESS_MIN + (TAIL_STIFFNESS_MAX - TAIL_STIFFNESS_MIN) * progress;
    const cTail = TAIL_DAMPING_MIN + (TAIL_DAMPING_MAX - TAIL_DAMPING_MIN) * progress;
    const tailAccel = -kTail * (tail.value - to) - cTail * tailV.value;
    tailV.value += tailAccel * h;
    tail.value += tailV.value * h;

    const settled =
      Math.abs(head.value - tail.value) < SETTLE_EPSILON &&
      Math.abs(headV.value) < SETTLE_VELOCITY_EPSILON &&
      Math.abs(tailV.value) < SETTLE_VELOCITY_EPSILON;

    if (settled) {
      head.value = to;
      tail.value = to;
      headV.value = 0;
      tailV.value = 0;
      settling.value = false;
    }
  });

  /** Starts (or restarts) the settle from wherever `head`/`tail` are now toward column `index`. */
  const beginSettle = useCallback(
    (index: number) => {
      "worklet";
      targetIndex.value = index;
      tailTrip.value = Math.max(Math.abs(tail.value - centerOf(index)), 1);
      settling.value = true;
    },
    [targetIndex, tailTrip, tail, centerOf, settling],
  );

  const pan = Gesture.Pan()
    // Below this, a touch is a tap, not a drag — lets a plain Pressable tap
    // underneath fire instead of this gesture claiming the responder.
    .minDistance(8)
    .onStart(() => {
      "worklet";
      dragging.value = true;
      settling.value = false;
      // No repositioning here: at rest `head`/`tail` already sit exactly on
      // the active tab (that IS the resting invariant), so there is nothing
      // to seed from a separate "origin" value — that used to be tracked in
      // its own shared value kept in sync via a JS-thread `useEffect`, which
      // could read stale on the very gesture that's supposed to react to it.
      headV.value = 0;
      tailV.value = 0;
    })
    .onUpdate((event) => {
      "worklet";
      // `event.x` is the touch's live position relative to the view this
      // gesture is attached to, which is the same coordinate space
      // `centerOf` works in — no border-inset shift needed (see `centerOf`).
      // Absolute position rather than `translationX` added to a captured
      // origin: no anchor to go stale.
      head.value = clamp(event.x, centerOf(0), centerOf(columnCount - 1));
      // "Never an end left in mid-air": the tail is always exactly at a real
      // column center, re-snapped every frame to whichever is nearest.
      tail.value = centerOf(nearestIndexTo(head.value));
    })
    .onEnd(() => {
      "worklet";
      dragging.value = false;
      const landing = nearestIndexTo(head.value);
      runOnJS(commitIndex)(landing);
      beginSettle(landing);
    });

  const handleBarLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      barWidth.value = width;

      // Docked full-width now, not a floating overlay a screen has to
      // manually clear: React Navigation sizes the space above the tab bar
      // from whatever height its `tabBar` reports back through this
      // context, the same mechanism the built-in bar uses via its own
      // `onLayout`. Without it, the navigator falls back to an estimate
      // that won't match this design's actual height.
      onHeightChange?.(height);

      // Seed head/tail onto the active column so the very first paint shows
      // a ring in the right place rather than one collapsed at x=0.
      // Computed from the local `width`, NOT from `barWidth.value` — that
      // read would still return the pre-write value on this thread.
      if (!settling.value && !dragging.value && activeIndex >= 0) {
        const cx = columnCount > 0 ? (width * (activeIndex + 0.5)) / columnCount : 0;
        head.value = cx;
        tail.value = cx;
      }
    },
    [activeIndex, barWidth, columnCount, dragging, head, onHeightChange, settling, tail],
  );

  const handleTabPress = useCallback(
    (index: number) => () => {
      commitIndex(index);
      beginSettle(index);
    },
    [beginSettle, commitIndex],
  );

  // Also settle when the active tab changes from OUTSIDE this bar — a deep
  // link, the Android back button, a programmatic `navigate`. Without this
  // the light would stay on the old tab in those cases, since nothing here
  // was tapped or dragged.
  useEffect(() => {
    if (activeIndex < 0) return;
    beginSettle(activeIndex);
  }, [activeIndex, beginSettle]);

  const rowCenterY = TAB_BAR_HEIGHT / 2;

  // Plain `Animated.View` + `useAnimatedStyle` rather than an SVG shape
  // wrapped in `Animated.createAnimatedComponent`: that combination depends
  // on `react-native-svg` correctly forwarding native prop updates to
  // Reanimated, which is a much less battle-tested path than Reanimated's
  // own core primitive. A `View` is guaranteed to update every frame.
  const rodStyle = useAnimatedStyle(() => {
    const left = Math.min(head.value, tail.value);
    const width = Math.abs(head.value - tail.value);
    const speed = Math.abs(headV.value) + Math.abs(tailV.value);
    const thickness = clamp(ROD_BASE_WIDTH + speed * ROD_SPEED_WIDTH, ROD_BASE_WIDTH, ROD_MAX_WIDTH);
    return {
      left,
      width,
      height: thickness,
      top: rowCenterY - thickness / 2,
      borderRadius: thickness / 2,
      opacity: width > SETTLE_EPSILON ? 1 : 0,
    };
  });

  // Tracks `head` directly rather than the `head`/`tail` midpoint it used
  // to. That old formula only put the ring somewhere sensible once the two
  // had converged (at rest, head === tail === the resting spot); mid-drag
  // it sat at a point between the two that belonged to neither. Following
  // `head` directly means the ring IS the moving point — no separate dot
  // needed, and no opacity gate either, since there's no longer a "wrong"
  // position for it to be caught showing at.
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: head.value }],
  }));

  return (
    // No floating wrapper — same docked, edge-to-edge approach as design 1:
    // this IS the bar, laid out by React Navigation as a normal flex sibling
    // of the screen content (see `onHeightChange` above), not an absolutely
    // positioned overlay a screen has to leave clearance for.
    <GestureDetector gesture={pan}>
      <View
        onLayout={handleBarLayout}
        style={{
          flexDirection: "row",
          // `flex-start`, not `center`: each column needs to start at the
          // bar's own top edge so its icon lands in the first
          // `TAB_BAR_HEIGHT` px — exactly where `rowCenterY` and the
          // ring/rod/light overlay expect it. The label sits right below
          // that in the next `LABEL_AREA_HEIGHT`, and everything past that
          // — `insets.bottom + BOTTOM_PADDING` — is empty background
          // clearing the home indicator, same role as design 1's
          // `paddingBottom: insets.bottom + spacing.sm`.
          alignItems: "flex-start",
          height: TAB_BAR_HEIGHT + LABEL_AREA_HEIGHT + insets.bottom + BOTTOM_PADDING,
          backgroundColor: theme.background.darker,
          borderTopWidth: BORDER_TOP_WIDTH,
          borderTopColor: theme.background.accent,
        }}
      >
        {/* Absolute and non-interactive so this draws over the icons
            without affecting their flex layout or intercepting taps — the
            icons still lay out as a plain equal-width row underneath. */}
        <View pointerEvents="none" style={{ ...StyleSheet.absoluteFillObject }}>
          <Animated.View
            style={[{ position: "absolute", backgroundColor: theme.primary.main }, rodStyle]}
          />
          <Animated.View
            style={[
              {
                position: "absolute",
                top: rowCenterY - RING_RADIUS,
                left: -RING_RADIUS,
                width: RING_RADIUS * 2,
                height: RING_RADIUS * 2,
                borderRadius: RING_RADIUS,
                borderWidth: 2,
                borderColor: theme.primary.main,
              },
              ringStyle,
            ]}
          />
        </View>

        {columns.map(({ route, routeIndex, tab }, index) => {
          const focused = routeIndex === state.index;
          const Icon = tab.icon;
          const iconColor = focused
            ? theme.primary.main
            : isDark
              ? INACTIVE_ICON_COLOR_DARK
              : INACTIVE_ICON_COLOR_LIGHT;

          return (
            <Pressable
              key={route.key}
              onPress={handleTabPress(index)}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={tab.title}
              style={{ flex: 1, alignItems: "center" }}
            >
              {/* Fixed to exactly the icon row's height so the icon's true
                  center lands at `rowCenterY` regardless of the label below
                  it — the ring/rod/light overlay is positioned against that
                  same constant and knows nothing about this column's actual
                  (taller) height. */}
              <View
                style={{
                  height: TAB_BAR_HEIGHT,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={ICON_SIZE} color={iconColor} variant={focused ? "Bold" : "Linear"} />
              </View>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: LABEL_FONT_SIZE,
                  color: iconColor,
                  marginTop: LABEL_MARGIN_TOP,
                }}
              >
                {tab.title}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </GestureDetector>
  );
}

export function TabDesign6({ tabs }: { tabs: TabConfig[] }) {
  const { theme } = useTheme();

  return (
    <Tabs
      tabBar={(props) => <GlassArcBar {...props} tabs={tabs} />}
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

export default TabDesign6;
