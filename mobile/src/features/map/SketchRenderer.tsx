import { useCallback, useState } from "react";
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import { useTheme } from "../../contexts/ThemeContext";
import { MapCluster } from "./MapCluster";
import { MapPin } from "./MapPin";
import { RouteLine } from "./RouteLine";
import type { RooviaMapProps } from "./types";
import { createProjector, type Point } from "./useMapRegion";

const CANVAS = 1000;
const PADDING = 80;
const CLUSTER_DISTANCE = 46;

/** Decorative topo-line texture — DESIGN.md's cartography concept made literal on the one screen with no real geography to draw. */
function ContourLines({ color }: { color: string }) {
  const lines = [140, 260, 420, 610, 780, 920];
  return (
    <>
      {lines.map((y, i) => {
        const wobble = 30 + (i % 3) * 12;
        const d = `M -50 ${y} Q ${CANVAS * 0.25} ${y - wobble}, ${CANVAS * 0.5} ${y} T ${CANVAS + 50} ${y}`;
        return <Path key={y} d={d} stroke={color} strokeWidth={1.5} fill="none" opacity={0.35} />;
      })}
    </>
  );
}

/** Same input contract as `MapboxRenderer` — nothing above this decides which one is live, see `RooviaMap`. */
export function SketchRenderer({ route, pins = [], activeId, onPressPin, liveMarker, interactive = true, style }: RooviaMapProps) {
  const { theme } = useTheme();
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  const scale = useSharedValue(1);
  const startScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setViewport({ width, height });
  }, []);

  const allPoints = [...(route?.coordinates ?? []), ...pins.map((p) => p.coordinate), ...(liveMarker ? [liveMarker] : [])];
  const project = createProjector(allPoints, CANVAS, PADDING);
  const routePoints: Point[] = route ? route.coordinates.map(project) : [];
  const liveMarkerAt = liveMarker ? project(liveMarker) : null;

  // Cluster pins that land within CLUSTER_DISTANCE canvas units of each other.
  const projectedPins = pins.map((pin) => ({ pin, at: project(pin.coordinate) }));
  const clusters: { at: Point; items: typeof projectedPins }[] = [];
  for (const entry of projectedPins) {
    const host = clusters.find(
      (c) => Math.hypot(c.at.x - entry.at.x, c.at.y - entry.at.y) < CLUSTER_DISTANCE,
    );
    if (host) host.items.push(entry);
    else clusters.push({ at: entry.at, items: [entry] });
  }

  const fitScale = viewport.width > 0 ? Math.min(viewport.width, viewport.height) / CANVAS : 1;

  const pan = Gesture.Pan()
    .enabled(interactive)
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = startX.value + e.translationX;
      translateY.value = startY.value + e.translationY;
    });

  const pinch = Gesture.Pinch()
    .enabled(interactive)
    .onStart(() => {
      startScale.value = scale.value;
    })
    .onUpdate((e) => {
      scale.value = Math.min(Math.max(startScale.value * e.scale, 0.5), 3);
    })
    .onEnd(() => {
      scale.value = withTiming(Math.min(Math.max(scale.value, 0.6), 2.5));
    });

  const gesture = Gesture.Simultaneous(pan, pinch);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: fitScale * scale.value },
    ],
  }));

  return (
    <View style={[styles.viewport, { backgroundColor: theme.colors.surfaceSunken }, style]} onLayout={onLayout}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.canvas, animatedStyle]}>
          <Svg width={CANVAS} height={CANVAS} style={StyleSheet.absoluteFill}>
            <ContourLines color={theme.colors.contour} />
            <RouteLine points={routePoints} color={theme.colors.lake} />
          </Svg>

          {clusters.map((cluster, i) =>
            cluster.items.length > 1 ? (
              <View key={i} style={{ position: "absolute", left: cluster.at.x - 16, top: cluster.at.y - 16 }}>
                <MapCluster count={cluster.items.length} />
              </View>
            ) : (
              <Pressable
                key={cluster.items[0].pin.id}
                onPress={() => onPressPin?.(cluster.items[0].pin.id)}
                style={{ position: "absolute", left: cluster.at.x - 18, top: cluster.at.y - 18 }}
              >
                <MapPin
                  kind={cluster.items[0].pin.kind}
                  order={cluster.items[0].pin.order}
                  active={cluster.items[0].pin.id === activeId}
                />
              </Pressable>
            ),
          )}

          {liveMarkerAt ? (
            <View
              style={[
                styles.liveMarkerRing,
                { left: liveMarkerAt.x - 14, top: liveMarkerAt.y - 14, borderColor: theme.colors.blaze },
              ]}
            >
              <View style={[styles.liveMarkerDot, { backgroundColor: theme.colors.blaze }]} />
            </View>
          ) : null}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: { flex: 1, overflow: "hidden" },
  canvas: { width: CANVAS, height: CANVAS, position: "absolute", left: 0, top: 0 },
  liveMarkerRing: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  liveMarkerDot: { width: 12, height: 12, borderRadius: 6 },
});
