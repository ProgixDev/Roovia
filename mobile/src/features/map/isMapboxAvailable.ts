/**
 * `@rnmapbox/maps` is a native module — installed and configured (see
 * app.config.js) but only usable after a native rebuild
 * (`bun run rebuild`), same class of gap as `expo-navigation-bar` earlier
 * in this project. Unlike that one, a map screen crashing would take down
 * five-plus sections at once (Carte tab, itinerary, services map, group
 * convoy, journal recap), so this is a real runtime guard, not a style
 * preference: `require` throws synchronously if the native side isn't
 * linked yet, and every map screen falls back to `SketchRenderer` until it
 * is — nothing else has to know which renderer is live.
 */
export const isMapboxAvailable: boolean = (() => {
  try {
    // Must be `require`, not `import`: a static import can't be caught if
    // the native module throws while linking.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("@rnmapbox/maps");
    return true;
  } catch {
    return false;
  }
})();
