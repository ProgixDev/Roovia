import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from "react-native-reanimated";

import { useTheme } from "../../contexts/ThemeContext";

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}

const THUMB = 26;
const TRACK_HEIGHT = 6;

/**
 * Track + thumb only — no value label. Every caller (budget, pace, driving
 * hours, nature↔ville, gratuit↔payant) displays its current value its own
 * way (a `heroStat` mono figure, a plain caption, two end labels…), so
 * formatting stays with the caller instead of this primitive guessing it.
 */
export function Slider({ value, min, max, step = 1, onChange }: SliderProps) {
  const { theme } = useTheme();
  const [trackWidth, setTrackWidth] = useState(0);
  const usable = Math.max(trackWidth - THUMB, 1);

  // `'worklet'`-annotated: `.onUpdate` below calls `xToValue` (which calls
  // `clamp`) synchronously on the UI thread. Reanimated's Babel plugin only
  // auto-worklet-izes the callback literal passed to `.onUpdate` itself —
  // a helper it calls that's defined outside that literal, like these,
  // still needs the directive explicitly or the call throws at runtime.
  // The directive doesn't stop them running on the JS thread too (the
  // `useEffect` and the `useSharedValue` initializer below both call
  // `valueToX` from plain JS) — a worklet is valid on both threads.
  const clamp = (v: number) => {
    "worklet";
    return Math.min(max, Math.max(min, v));
  };
  const valueToX = (v: number) => {
    "worklet";
    return ((clamp(v) - min) / (max - min || 1)) * usable;
  };
  const xToValue = (x: number) => {
    "worklet";
    const raw = min + (x / usable) * (max - min);
    return clamp(Math.round(raw / step) * step);
  };

  const translateX = useSharedValue(valueToX(value));
  const startX = useSharedValue(0);

  useEffect(() => {
    translateX.value = valueToX(value);
    // Re-sync only when the controlled value or the measured track changes —
    // an in-progress drag's own `translateX` writes shouldn't be undone by
    // this effect re-running for an unrelated reason.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, trackWidth]);

  const pan = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
    })
    .onUpdate((e) => {
      const next = Math.min(usable, Math.max(0, startX.value + e.translationX));
      translateX.value = next;
      runOnJS(onChange)(xToValue(next));
    });

  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));
  const fillStyle = useAnimatedStyle(() => ({ width: translateX.value + THUMB / 2 }));

  return (
    <View
      style={styles.wrap}
      onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
    >
      <View style={[styles.track, { backgroundColor: theme.colors.line }]}>
        <Animated.View style={[styles.fill, { backgroundColor: theme.colors.blaze }, fillStyle]} />
      </View>
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            styles.thumb,
            { backgroundColor: theme.colors.blaze, borderColor: theme.colors.ground, shadowColor: theme.shadow.color },
            thumbStyle,
          ]}
        />
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: THUMB, justifyContent: "center" },
  track: { height: TRACK_HEIGHT, borderRadius: TRACK_HEIGHT / 2, overflow: "hidden" },
  fill: { height: TRACK_HEIGHT },
  thumb: {
    position: "absolute",
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    borderWidth: 3,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
});
