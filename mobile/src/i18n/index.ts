import { fr, type Dictionary } from "./fr";

/**
 * Dot-path union of every string key in the dictionary, e.g.
 * `"traveler.title"` — so `t()` rejects a typo'd key at compile time
 * instead of silently rendering nothing at runtime.
 */
type Paths<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string ? `${Prefix}${K}` : Paths<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type TranslationKey = Paths<Dictionary>;

function readPath(dict: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((node, key) => {
    if (node && typeof node === "object" && key in node) {
      return (node as Record<string, unknown>)[key];
    }
    return undefined;
  }, dict);
}

/**
 * French is the only live locale — see todo.md's "International" section
 * (§14 in IMPLEMENTATION_PLAN.md), not built yet. `t()` already takes the
 * key/vars shape that section needs, so switching the lookup to a
 * `settingsStore`-selected locale later touches this one function, not
 * every call site.
 */
export function t(key: TranslationKey, vars?: Record<string, string | number>): string {
  const value = readPath(fr, key);
  if (typeof value !== "string") {
    if (__DEV__) console.warn(`[i18n] missing key: ${key}`);
    return key;
  }
  if (!vars) return value;
  return Object.entries(vars).reduce((s, [k, v]) => s.split(`{{${k}}}`).join(String(v)), value);
}

export function useT(): typeof t {
  return t;
}
