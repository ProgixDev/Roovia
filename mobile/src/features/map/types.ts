import type { Ionicons } from "@expo/vector-icons";
import type { StyleProp, ViewStyle } from "react-native";

import { mapPins } from "../../constants/themes";

export interface LatLng {
  latitude: number;
  longitude: number;
}

/** The 8 categories DESIGN.md's pin legend fixes one color each for. */
export type PoiCategory = keyof typeof mapPins;

/**
 * Finer-grained than `PoiCategory` on purpose — "market" is its own concept
 * in todo.md's POI layer list but DESIGN.md deliberately caps the legend at
 * 8 colors, so it shares the `viewpoint` color slot and is told apart by
 * icon instead. Every other kind maps 1:1 to a category.
 */
export type PoiKind =
  | "fuel"
  | "water"
  | "dumpStation"
  | "toilets"
  | "bivouac"
  | "campsite"
  | "viewpoint"
  | "market"
  | "parking";

export const CATEGORY_BY_KIND: Record<PoiKind, PoiCategory> = {
  fuel: "fuel",
  water: "water",
  dumpStation: "dumpStation",
  toilets: "toilets",
  bivouac: "bivouac",
  campsite: "campsite",
  viewpoint: "viewpoint",
  market: "viewpoint",
  parking: "parking",
};

/** No Ionicons glyph reads as "toilet" — `MapPin` renders "WC" as text instead. */
export const ICON_BY_KIND: Partial<Record<PoiKind, keyof typeof Ionicons.glyphMap>> = {
  fuel: "flash-outline",
  water: "water-outline",
  dumpStation: "trash-outline",
  bivouac: "bonfire-outline",
  campsite: "trail-sign-outline",
  viewpoint: "binoculars-outline",
  market: "basket-outline",
  parking: "car-outline",
};

export const POI_KIND_LABEL: Record<PoiKind, string> = {
  fuel: "Carburant",
  water: "Eau potable",
  dumpStation: "Vidange",
  toilets: "Toilettes",
  bivouac: "Bivouac",
  campsite: "Camping payant",
  viewpoint: "Point de vue",
  market: "Marché",
  parking: "Parking",
};

export interface MapPinData {
  id: string;
  kind: PoiKind;
  coordinate: LatLng;
  /** Itinerary stop order — renders as a number instead of the kind's icon. */
  order?: number;
}

export interface MapRouteData {
  coordinates: LatLng[];
}

export interface RooviaMapProps {
  route?: MapRouteData;
  pins?: MapPinData[];
  activeId?: string | null;
  onPressPin?: (id: string) => void;
  /** A moving position, not a place — a live-trip marker (§4) or a group member's convoy position (§12). Rendered as a plain dot, never a category pin. */
  liveMarker?: LatLng;
  /** Pan/pinch enabled. Off for small static previews (recap cards, thumbnails). */
  interactive?: boolean;
  style?: StyleProp<ViewStyle>;
}
