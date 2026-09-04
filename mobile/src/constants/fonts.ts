/**
 * Local font loading (see DESIGN.md § Typography). Deliberately not the
 * `@expo-google-fonts/*` packages the demo screens use elsewhere — Big
 * Shoulders Display's package is flagged deprecated on npm ("removed from
 * Google Fonts, no longer receives updates"), so all four families load
 * from the static `.ttf` files in `assets/fonts/` instead, kept to exactly
 * the weights DESIGN.md specifies.
 */

// Passed straight to `useFonts()` in the root layout.
export const fontAssets = {
  "BigShouldersDisplay-Bold": require("../../assets/fonts/BigShoulders_60pt-Bold.ttf"),
  "BigShouldersDisplay-Black": require("../../assets/fonts/BigShoulders_60pt-Black.ttf"),
  "Newsreader-Italic": require("../../assets/fonts/Newsreader_14pt-Italic.ttf"),
  "Newsreader-MediumItalic": require("../../assets/fonts/Newsreader_14pt-MediumItalic.ttf"),
  "Outfit-Regular": require("../../assets/fonts/Outfit-Regular.ttf"),
  "Outfit-Medium": require("../../assets/fonts/Outfit-Medium.ttf"),
  "Outfit-SemiBold": require("../../assets/fonts/Outfit-SemiBold.ttf"),
  "Outfit-Bold": require("../../assets/fonts/Outfit-Bold.ttf"),
  "SpaceMono-Regular": require("../../assets/fonts/SpaceMono-Regular.ttf"),
  "SpaceMono-Bold": require("../../assets/fonts/SpaceMono-Bold.ttf"),
} as const;

/**
 * DESIGN.md typographic roles → loaded font-family key. Use these in
 * `style={{ fontFamily: fonts.display }}` rather than the raw strings above,
 * so a future weight swap only touches this file.
 */
export const fonts = {
  display: "BigShouldersDisplay-Bold", // section heads, 28px+
  displayBlack: "BigShouldersDisplay-Black", // hero stats / trip titles, 44px
  body: "Outfit-Regular", // running text, 400
  bodyMedium: "Outfit-Medium", // captions/eyebrows, 500
  bodySemiBold: "Outfit-SemiBold", // card titles, buttons, 600
  bodyBold: "Outfit-Bold", // 700, used sparingly
  editorial: "Newsreader-Italic", // journal entries, quotes, 400 italic
  editorialMedium: "Newsreader-MediumItalic", // 500 italic
  mono: "SpaceMono-Regular", // coordinates, budget figures, distances
  monoBold: "SpaceMono-Bold",
} as const;
