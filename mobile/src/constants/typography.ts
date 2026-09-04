import { StyleSheet } from "react-native";

import { fonts } from "./fonts";

/**
 * One style object per DESIGN.md § Typography row, values computed straight
 * from its Size × Line-height ratio so nothing here is eyeballed. Screens
 * should reach for these instead of hand-rolling `fontSize`/`lineHeight` —
 * four separate files independently reinvented a slightly-different
 * "caption" before this existed, which is exactly the drift this prevents.
 *
 * Color is deliberately NOT included — that always comes from
 * `theme.colors.*`, which these compose with via a style array:
 * `style={[typography.body, { color: theme.colors.ink }]}`.
 */
export const typography = StyleSheet.create({
  /** "2,340 km", trip names, the app's odometer voice — and a full hero
   * moment like the auth chooser's "Welcome to Roovia". */
  heroStat: {
    fontFamily: fonts.displayBlack,
    fontSize: 44,
    lineHeight: 42, // 0.95
  },
  /** Screen titles, day headers. */
  sectionHead: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 29, // 1.05
  },
  /** POI names, list items. */
  cardTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 18,
    lineHeight: 23, // 1.3
  },
  /** Descriptions, running text. */
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23, // 1.5
  },
  /** Buttons, form labels. */
  button: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    lineHeight: 20, // 1.3
  },
  /** Timestamps, category labels — small, uppercase, tracked. */
  caption: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 16, // 1.3
    textTransform: "uppercase",
    letterSpacing: 0.72, // 0.06em
  },
  /** Coordinates, budget figures, distances — tabular. */
  mono: {
    fontFamily: fonts.mono,
    fontSize: 15,
    lineHeight: 21, // 1.4
    fontVariant: ["tabular-nums"],
  },
  /** Journal entries, community reviews, pull quotes. */
  editorial: {
    fontFamily: fonts.editorialMedium,
    fontSize: 19,
    lineHeight: 27, // 1.4
  },
});
