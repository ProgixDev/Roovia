"use client";

import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { THEME_VARIANTS, VARIANT_STORAGE_KEY, type ThemeVariant } from "./theme-variants";

export { THEME_VARIANTS, VARIANT_STORAGE_KEY, type ThemeVariant };

const DEFAULT_VARIANT = "default";

interface VariantContextValue {
  variantId: string;
  setVariantId: (id: string) => void;
}

const VariantContext = createContext<VariantContextValue>({
  variantId: DEFAULT_VARIANT,
  setVariantId: () => {},
});

/**
 * The color-palette axis (default/nord/sapphire/...), independent of
 * next-themes' light/dark axis — the two combine freely via separate
 * selectors in globals.css (`[data-theme="x"]` vs `.dark[data-theme="x"]`).
 * next-themes handles its own axis natively; this one doesn't have a
 * library, so it's the same small pattern hand-rolled: read from
 * localStorage once mounted, apply as a DOM attribute, persist on change.
 */
function VariantProvider({ children }: { children: ReactNode }) {
  const [variantId, setVariantIdState] = useState(DEFAULT_VARIANT);

  useEffect(() => {
    // localStorage doesn't exist during SSR/the first client render — this
    // can only run after mount, which is exactly what an effect is for, not
    // a workaround around one.
    //
    // Resolve and apply the attribute in the SAME effect: a separate
    // `useEffect(() => setAttribute(variantId), [variantId])` would still run
    // once on mount with the stale `DEFAULT_VARIANT` state (before this
    // effect's `setState` commits), stomping the value RootLayout's blocking
    // script already set — a visible flash back to the default palette
    // before flipping to the stored one. Applying it here, once, from the
    // resolved value, is what actually avoids that.
    const stored = localStorage.getItem(VARIANT_STORAGE_KEY);
    const resolved =
      stored && THEME_VARIANTS.some((v) => v.id === stored) ? stored : DEFAULT_VARIANT;
    document.documentElement.setAttribute("data-theme", resolved);
    if (resolved !== DEFAULT_VARIANT) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVariantIdState(resolved);
    }
  }, []);

  const setVariantId = (id: string) => {
    setVariantIdState(id);
    document.documentElement.setAttribute("data-theme", id);
    localStorage.setItem(VARIANT_STORAGE_KEY, id);
  };

  return (
    <VariantContext.Provider value={{ variantId, setVariantId }}>
      {children}
    </VariantContext.Provider>
  );
}

/**
 * Mirrors mobile's contexts/ThemeContext.tsx: one provider, one `useTheme()`
 * hook for both the mode axis (light/dark/system) and the variant axis
 * (default/nord/sapphire/...) — composed from next-themes (mode) and
 * VariantProvider (variant) internally, so nothing outside this file needs
 * to know there are two mechanisms under the hood.
 *
 * `attribute="class"` toggles a `.dark` class on `<html>`, which is exactly
 * what globals.css's `@custom-variant dark (&:is(.dark *))` already expects.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <VariantProvider>{children}</VariantProvider>
    </NextThemesProvider>
  );
}

interface UseThemeResult {
  themeMode: "light" | "dark" | "system";
  variantId: string;
  isDark: boolean;
  setThemeMode: (mode: "light" | "dark" | "system") => void;
  setVariantId: (id: string) => void;
}

/**
 * Same shape as mobile's `useTheme()` (themeMode/variantId/isDark/
 * setThemeMode/setVariantId) — minus a JS `theme` color object, which
 * doesn't have a web equivalent: colors here are CSS custom properties
 * (globals.css), read by Tailwind classes, not JS. That difference is
 * platform-driven (React Native has no CSS cascade to lean on; web does,
 * and re-deriving a parallel JS theme object here would fight the Tailwind
 * setup every ported shadcn component already relies on) — everything else
 * about the API is deliberately identical.
 */
export function useTheme(): UseThemeResult {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const { variantId, setVariantId } = useContext(VariantContext);

  return {
    themeMode: (theme as UseThemeResult["themeMode"] | undefined) ?? "system",
    variantId,
    isDark: resolvedTheme === "dark",
    setThemeMode: setTheme,
    setVariantId,
  };
}
