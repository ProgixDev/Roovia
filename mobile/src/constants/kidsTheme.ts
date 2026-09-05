/**
 * Deliberately its own palette, not derived from the main app's `colors`
 * tokens — todo.md calls for a skin "distinct from the main app skin", and
 * a kids mode that just reused the topo-map palette at higher saturation
 * would still read as the same adult product with a filter on it.
 */
export const kidsTheme = {
  background: "#FFF6E5",
  surface: "#FFFFFF",
  ink: "#3A2E1F",
  inkMuted: "#8A7A5C",
  primary: "#FF8A3D", // action orange — warmer/rounder than the main app's `blaze`
  primaryInk: "#FFFFFF",
  sun: "#FFC93C",
  leaf: "#5FB86A",
  sky: "#4FB8E8",
  berry: "#E85D75",
  line: "#F0DFC0",
} as const;

/** Minimum touch target, per todo.md's "big targets". */
export const KIDS_MIN_TARGET = 64;
