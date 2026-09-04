// Plain data, deliberately not in ThemeContext.tsx: that file is "use client",
// and RootLayout (a server component) needs these at module-eval time, before
// hydration, for its blocking data-theme script — importing an array straight
// out of a "use client" module into a server component doesn't give back the
// real array (Next wraps it as a client reference), so this has to live in a
// directive-free module both sides can import without crossing that boundary.

export interface ThemeVariant {
  id: string;
  name: string;
}

// Matches mobile's constants/themes.ts variant list exactly (id + display name).
export const THEME_VARIANTS: ThemeVariant[] = [
  { id: "default", name: "Default" },
  { id: "nord", name: "Nord" },
  { id: "sapphire", name: "Sapphire" },
  { id: "strawberry", name: "Strawberry Daiquiri" },
  { id: "ocean", name: "Ocean" },
  { id: "amber", name: "Amber" },
  { id: "worldhair", name: "WorldHair" },
];

export const VARIANT_STORAGE_KEY = "theme-variant";
