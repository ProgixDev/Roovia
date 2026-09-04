export interface Theme {
  // Legacy 3-field shape — kept because the demo screens (TabDesign1-9,
  // OnboardingDesign1-6, Skeleton, ThemeVariantPreview...) already consume
  // it and are already correctly Roovia-colored. New screens should prefer
  // `colors` below, which carries the full DESIGN.md token set.
  primary: {
    main: string;
    light: string;
    dark: string;
  };
  background: {
    dark: string;
    darker: string;
    accent: string;
  };
  foreground: {
    white: string;
    gray: string;
  };
  logo: any; // Image require() source

  // Full DESIGN.md palette — see DESIGN.md § Colors for the rationale
  // behind each token's job.
  colors: {
    ground: string; // app background
    surface: string; // card / sheet base
    surfaceSunken: string; // recessed panels, code/mono blocks
    surfaceRaised: string; // modals, floating sheets — one step above surface
    ink: string; // body text, icons
    inkMuted: string; // secondary text, captions
    line: string; // hairline borders, dividers
    blaze: string; // primary action — the one saturated color
    blazeInk: string; // text/icons drawn on a `blaze` fill
    lake: string; // links, route line on the map, water POIs
    moss: string; // success states, campsite POIs
    contour: string; // dividers, elevation/distance data, earth POIs
    plum: string; // map pins only — viewpoint
    slate: string; // map pins only — toilets
    danger: string;
    amber: string; // warning; also the parking pin
  };

  // RN-native shadow, derived from DESIGN.md's CSS shadow spec (a raw CSS
  // `box-shadow` string isn't usable in React Native — this is its
  // shadowColor/shadowOpacity/shadowOffset/shadowRadius + Android elevation
  // equivalent).
  shadow: {
    color: string;
    opacity: number;
    offset: { width: number; height: number };
    radius: number;
    elevation: number; // Android
  };
}

export interface ThemeVariant {
  id: string;
  name: string;
  light: Theme;
  dark: Theme;
}

// Default Theme Variant — Roovia's palette (see DESIGN.md).
// A topo-map register: paper/ink neutrals, trail-blaze orange as the one
// saturated accent. `background.dark/darker/accent` follow the codebase's
// existing elevation convention (dark = page, darker = card/bar fill,
// accent = border & skeleton contrast — see TabDesign5/8/9 and Skeleton.tsx),
// mapped onto DESIGN.md's ground/surface/line tokens.
const defaultVariant: ThemeVariant = {
  id: "default",
  name: "Roovia",
  dark: {
    primary: {
      main: "#FF7A3D",
      light: "#FF9A66",
      dark: "#E8540C",
    },
    background: {
      dark: "#141B14",
      darker: "#1C241C",
      accent: "#333A2E",
    },
    foreground: {
      white: "#EDEADA",
      gray: "#9CA391",
    },
    logo: require("../../assets/images/Logo.png"),
    colors: {
      ground: "#141B14",
      surface: "#1C241C",
      surfaceSunken: "#0F150F",
      surfaceRaised: "#26312A",
      ink: "#EDEADA",
      inkMuted: "#9CA391",
      line: "#333A2E",
      blaze: "#FF7A3D",
      blazeInk: "#1B241C",
      lake: "#5AB1CC",
      moss: "#86B366",
      contour: "#C39B6C",
      plum: "#A987B8",
      slate: "#7C93A8",
      danger: "#E4796A",
      amber: "#E3B65C",
    },
    shadow: {
      color: "#000000",
      opacity: 0.45,
      offset: { width: 0, height: 8 },
      radius: 20,
      elevation: 8,
    },
  },
  light: {
    primary: {
      main: "#E8540C",
      light: "#F2895A",
      dark: "#C2450A",
    },
    background: {
      dark: "#EFF1E7",
      darker: "#FBFAF4",
      accent: "#D8D6C6",
    },
    foreground: {
      white: "#1B241C",
      gray: "#5B6357",
    },
    logo: require("../../assets/images/Logo.png"),
    colors: {
      ground: "#EFF1E7",
      surface: "#FBFAF4",
      surfaceSunken: "#F2EFDF",
      surfaceRaised: "#FFFFFF",
      ink: "#1B241C",
      inkMuted: "#5B6357",
      line: "#D8D6C6",
      blaze: "#E8540C",
      blazeInk: "#FFF8EE",
      lake: "#1F5C74",
      moss: "#4C6B3F",
      contour: "#8B6B47",
      plum: "#6B4C7A",
      slate: "#46586B",
      danger: "#B23A2E",
      amber: "#C98A1F",
    },
    shadow: {
      color: "#1B241C",
      opacity: 0.1,
      offset: { width: 0, height: 6 },
      radius: 16,
      elevation: 4,
    },
  },
};

export const themeVariants: ThemeVariant[] = [defaultVariant];

export type ThemeMode = "system" | "light" | "dark";

/**
 * Layout spacing scale. Independent of theme variant and mode.
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

/**
 * Corner radius scale (DESIGN.md § rounded). Not mode-dependent, so it lives
 * outside the light/dark split, same as `spacing`.
 */
export const radius = {
  sm: 8, // inputs, small controls
  md: 14, // cards, stat tiles
  lg: 24, // POI cards, sheets
  xl: 32, // bottom sheets, modals
  pill: 999, // buttons, chips
} as const;

/**
 * Map-pin palette (DESIGN.md § Map pin legend). Flat, not mode-split — pin
 * colors identify a POI category on the map surface itself and stay
 * constant regardless of the app's light/dark theme, the same way a
 * physical map's legend ink doesn't change with the light in the room.
 */
export const mapPins = {
  fuel: "#E8540C",
  water: "#1F5C74",
  dumpStation: "#8B6B47",
  toilets: "#46586B",
  bivouac: "#2F4A29",
  campsite: "#4C6B3F",
  viewpoint: "#6B4C7A",
  parking: "#C98A1F",
} as const;

// Helper function to get theme by variant and mode
export function getThemeByVariantAndMode(
  variantId: string,
  mode: "light" | "dark",
): Theme {
  const variant =
    themeVariants.find((v) => v.id === variantId) || defaultVariant;
  return mode === "light" ? variant.light : variant.dark;
}
