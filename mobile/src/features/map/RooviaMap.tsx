import { SketchRenderer } from "./SketchRenderer";
import type { RooviaMapProps } from "./types";
import { isMapboxAvailable } from "./isMapboxAvailable";

const hasToken = !!process.env.EXPO_PUBLIC_MAPBOX_PK;

// Lazy, not a static import: `MapboxRenderer` pulls in `@rnmapbox/maps`,
// whose own import throws if the native module isn't linked yet. Importing
// it only after `isMapboxAvailable` has already proven the require-time
// throw doesn't happen keeps that crash from reaching this module's own
// import, which every map screen depends on transitively.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const MapboxRenderer = isMapboxAvailable && hasToken ? require("./MapboxRenderer").MapboxRenderer : null;

/**
 * The only map import screens should use. Picks Mapbox when the native
 * module is linked and a public token is configured, otherwise the
 * dependency-free SVG sketch renderer — same props either way, so nothing
 * downstream needs to know which one is live. See §0.2 of
 * IMPLEMENTATION_PLAN.md.
 */
export function RooviaMap(props: RooviaMapProps) {
  if (MapboxRenderer) return <MapboxRenderer {...props} />;
  return <SketchRenderer {...props} />;
}
