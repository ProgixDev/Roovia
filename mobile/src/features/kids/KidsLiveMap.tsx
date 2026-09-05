import { StyleSheet, Text, View } from "react-native";

import { fonts } from "../../constants/fonts";
import { kidsTheme } from "../../constants/kidsTheme";
import type { LatLng } from "../map/types";
import { RooviaMap } from "../map/RooviaMap";

interface KidsLiveMapProps {
  position: LatLng | null;
  routeCoordinates: LatLng[];
  progress: number;
}

/**
 * The map surface itself still renders in the main app's theme — threading
 * a second palette through `RooviaMap`'s renderers wasn't worth it for one
 * screen — but everything around it (the label, the big marker callout,
 * the time-left bar) is fully kids-styled.
 */
export function KidsLiveMap({ position, routeCoordinates, progress }: KidsLiveMapProps) {
  return (
    <View>
      <View style={styles.mapFrame}>
        {position ? (
          <RooviaMap route={{ coordinates: routeCoordinates }} liveMarker={position} interactive={false} style={{ flex: 1 }} />
        ) : null}
        <View style={styles.hereLabel}>
          <Text style={styles.hereText}>On est ici !</Text>
        </View>
      </View>

      <Text style={styles.barLabel}>Temps avant la prochaine étape</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(100, Math.max(4, progress * 100))}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapFrame: { height: 220, borderRadius: 28, overflow: "hidden", borderWidth: 3, borderColor: kidsTheme.line, backgroundColor: kidsTheme.surface },
  hereLabel: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: kidsTheme.primary,
    borderRadius: 999,
    paddingHorizontal: 14,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  hereText: { fontFamily: fonts.bodySemiBold, color: kidsTheme.primaryInk, fontSize: 14 },
  barLabel: { fontFamily: fonts.bodyMedium, color: kidsTheme.inkMuted, fontSize: 13, marginTop: 16, marginBottom: 8 },
  track: { height: 20, borderRadius: 10, backgroundColor: kidsTheme.line, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 10, backgroundColor: kidsTheme.sun },
});
