import type { Dictionary } from "./fr";

/**
 * Filled in during todo.md's "International" section (§14) — the app is
 * French-only until then (see `index.ts`'s `LOCALE` constant). Typed as a
 * partial of `fr`'s exact shape so a key can never silently drift between
 * the two dictionaries.
 */
export const en: DeepPartial<Dictionary> = {};

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };
