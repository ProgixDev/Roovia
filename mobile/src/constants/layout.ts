/**
 * The active tab bar (`components/screens/tabs/TabDesign9`) is a floating
 * `position: "absolute"` overlay, not a normal navigator bar that reserves
 * its own layout space — screen content runs the full device height
 * underneath it (see `TabDesign9`'s `COLLAPSED_HEIGHT` / `MIN_BOTTOM_GAP`,
 * and `(tabs)/_layout.tsx`'s comment on the same thing). Any screen under
 * the tabs that docks its own content to the bottom (a CTA, a footer)
 * needs this to sit above the bar instead of behind it.
 *
 * Deliberately not imported FROM TabDesign9 — that file is template
 * scaffolding, swappable for a different TabDesignN, and a real screen
 * shouldn't structurally depend on which one is active. If the active
 * design changes to one with a different bar footprint, update these two
 * numbers to match it.
 */
export const TAB_BAR_HEIGHT = 64;
export const TAB_BAR_MIN_BOTTOM_GAP = 12;

export function tabBarReservedSpace(insetsBottom: number): number {
  return TAB_BAR_HEIGHT + Math.max(insetsBottom, TAB_BAR_MIN_BOTTOM_GAP);
}
