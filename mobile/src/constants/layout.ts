/**
 * The tab bar (`features/navigation/TabBar`) is a floating
 * `position: "absolute"` overlay, not a normal navigator bar that reserves
 * its own layout space — screen content runs the full device height
 * underneath it (see `TabBar`'s `BAR_HEIGHT` / `MIN_BOTTOM_GAP`). Any
 * screen under the tabs that docks its own content to the bottom (a CTA, a
 * footer) needs this to sit above the bar instead of behind it.
 *
 * Deliberately not imported FROM TabBar — a real screen shouldn't
 * structurally depend on the bar component. If the bar's footprint ever
 * changes, update these two numbers to match it.
 */
export const TAB_BAR_HEIGHT = 64;
export const TAB_BAR_MIN_BOTTOM_GAP = 12;

export function tabBarReservedSpace(insetsBottom: number): number {
  return TAB_BAR_HEIGHT + Math.max(insetsBottom, TAB_BAR_MIN_BOTTOM_GAP);
}
