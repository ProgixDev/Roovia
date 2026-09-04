import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Mapbox from "@rnmapbox/maps";

import { useTheme } from "../../contexts/ThemeContext";
import { MapPin } from "./MapPin";
import type { LatLng, RooviaMapProps } from "./types";
import { computeBounds } from "./useMapRegion";

const PUBLIC_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_PK ?? null;
// A custom Studio style (paper ground, `contour`-tinted topo lines, muted
// roads) is the long-term plan per DESIGN.md; this env var swaps it in
// without a code change once one is published. Light is the closest stock
// style until then.
const STYLE_URL = process.env.EXPO_PUBLIC_MAPBOX_STYLE_URL || Mapbox.StyleURL.Light;

if (PUBLIC_TOKEN) {
  Mapbox.setAccessToken(PUBLIC_TOKEN);
}

// GeoJSON order is [longitude, latitude] — the opposite of this app's own
// `LatLng`, so every coordinate crossing into Mapbox goes through this.
const toPosition = (p: LatLng): [number, number] => [p.longitude, p.latitude];

/** Same input contract as `SketchRenderer` — see `RooviaMap` for the switch between the two. */
export function MapboxRenderer({ route, pins = [], activeId, onPressPin, interactive = true, style }: RooviaMapProps) {
  const { theme } = useTheme();

  const bounds = useMemo(() => {
    const allPoints = [...(route?.coordinates ?? []), ...pins.map((p) => p.coordinate)];
    const b = computeBounds(allPoints);
    if (!b) return undefined;
    return {
      ne: toPosition({ latitude: b.maxLat, longitude: b.maxLng }),
      sw: toPosition({ latitude: b.minLat, longitude: b.minLng }),
    };
  }, [route, pins]);

  const routeShape = useMemo(
    () =>
      route
        ? ({
            type: "LineString" as const,
            coordinates: route.coordinates.map(toPosition),
          } as GeoJSON.LineString)
        : null,
    [route],
  );

  return (
    <View style={[styles.flex, style]}>
      <Mapbox.MapView
        style={styles.flex}
        styleURL={STYLE_URL}
        compassEnabled={interactive}
        scaleBarEnabled={false}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        rotateEnabled={interactive}
      >
        <Mapbox.Camera bounds={bounds} padding={{ paddingLeft: 60, paddingRight: 60, paddingTop: 60, paddingBottom: 60 }} animationDuration={0} />

        {routeShape ? (
          <Mapbox.ShapeSource id="roovia-route" shape={routeShape}>
            <Mapbox.LineLayer
              id="roovia-route-line"
              style={{ lineColor: theme.colors.lake, lineWidth: 3, lineDasharray: [1, 2], lineCap: "round" }}
            />
          </Mapbox.ShapeSource>
        ) : null}

        {pins.map((pin) => (
          <Mapbox.MarkerView key={pin.id} coordinate={toPosition(pin.coordinate)}>
            <Pressable onPress={() => onPressPin?.(pin.id)}>
              <MapPin kind={pin.kind} order={pin.order} active={pin.id === activeId} />
            </Pressable>
          </Mapbox.MarkerView>
        ))}
      </Mapbox.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
