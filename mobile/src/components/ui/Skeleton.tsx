import React, { useEffect } from "react";
import { AccessibilityInfo, StyleSheet, View, type ViewStyle } from "react-native";
import Animated, {
  makeMutable,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { useTheme } from "../../contexts/ThemeContext";

interface SkeletonBlockProps {
  /** Omit for a block that fills its parent's width. */
  width?: ViewStyle["width"];
  height?: ViewStyle["height"];
  /** Pass 9999 for a pill, 0 for a square edge. */
  radius?: number;
  style?: ViewStyle;
  /** Only for tests — a placeholder is invisible to screen readers, so a testID is the only handle on one. */
  testID?: string;
}

const PULSE_MS = 900;

/**
 * ONE pulse, shared by every skeleton on screen.
 *
 * Module scope rather than per-component: a shared value per block means each
 * starts its own timing curve when it happens to mount, so a grid of six
 * cards breathes six different ways. The eye reads that as six separate
 * objects flickering at each other rather than one surface waiting to be
 * filled.
 *
 * Driven once, on first use, and never stopped: it is a single timing loop
 * for the whole app, costs nothing while no skeleton is mounted (nothing
 * subscribes to it), and restarting it per mount is what causes the drift.
 */
const pulse = makeMutable(0.5);
let pulseStarted = false;

function startPulse(): void {
  if (pulseStarted) {
    return;
  }
  pulseStarted = true;
  pulse.value = withRepeat(withTiming(1, { duration: PULSE_MS }), -1, true);
}

/** Starts the shared pulse unless the viewer has asked for reduced motion. */
function usePulse(): void {
  useEffect(() => {
    let cancelled = false;

    void AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (!cancelled && !reduceMotion) {
        startPulse();
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);
}

/**
 * A plain grey block. Carries NO animation of its own.
 *
 * That is the point: opacity is what a skeleton animates, and opacity
 * COMPOSITES. Two translucent blocks that overlap stack to a darker patch
 * exactly where they meet, so the two read as separate objects however
 * carefully their colour and timing are matched. Blocks are opaque; the
 * group above them fades as one.
 *
 * Use `SkeletonGroup` to animate a set of these, or `Skeleton` for a lone
 * block that needs no grouping.
 */
export function SkeletonBlock({
  width,
  height,
  radius = 12,
  style,
  testID,
}: SkeletonBlockProps) {
  const { theme } = useTheme();

  return (
    <View
      testID={testID}
      style={[
        styles.block,
        { backgroundColor: theme.background.accent, borderRadius: radius },
        width !== undefined && { width },
        height !== undefined && { height },
        style,
      ]}
    />
  );
}

/**
 * Fades a whole set of blocks as one surface.
 *
 * Everything inside shares a single opacity, so overlapping blocks never
 * composite against each other.
 *
 * Hidden from screen readers here rather than per block: a placeholder has
 * nothing to announce, and a dozen of them would announce it a dozen times.
 * The screen that owns the group should say "loading", once.
 */
export function SkeletonGroup({
  children,
  style,
  testID,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}) {
  usePulse();
  const animatedStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Animated.View
      testID={testID}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[style, animatedStyle]}
    >
      {children}
    </Animated.View>
  );
}

/**
 * One grey block standing in for content that has not arrived.
 *
 * A skeleton beats a spinner when a screen knows its own shape before it
 * knows its data — the layout doesn't jump when content lands, and the wait
 * reads as "this is filling in" rather than "something is happening
 * somewhere".
 *
 * Deliberately NOT a shimmer sweep: a gradient travelling across every
 * placeholder is its own kind of noise, and on a grid of many cards it reads
 * as many competing animations. A slow opacity pulse says the same thing
 * quietly, and every block shares the one pulse above.
 *
 * Honours "reduce motion" — the pulse carries no information the static block
 * does not.
 */
export function Skeleton({ testID, ...block }: SkeletonBlockProps) {
  // `testID` rides the GROUP, not the block: the group is the outer element
  // and the one carrying the accessibility flags, so a test that reaches for
  // this skeleton should land on the thing that actually represents it.
  return (
    <SkeletonGroup testID={testID}>
      <SkeletonBlock {...block} />
    </SkeletonGroup>
  );
}

/**
 * A skeleton's own text-line convention: a block the height of a line of
 * copy, at a share of the available width.
 *
 * Separate from `Skeleton` because a line of text is the one shape that
 * should not be square-cornered or full-width by default — a run of
 * identical full-width bars reads as a table, not a paragraph.
 *
 * Renders a bare BLOCK, not a group: these are almost always inside a group
 * already, and nesting a second opacity inside one is the compositing bug
 * this whole split exists to avoid.
 */
export function SkeletonLine({
  width = "100%",
  height = 12,
  style,
}: Pick<SkeletonBlockProps, "width" | "height" | "style">) {
  return <SkeletonBlock width={width} height={height} radius={6} style={style} />;
}

const styles = StyleSheet.create({
  block: {
    overflow: "hidden",
  },
});
