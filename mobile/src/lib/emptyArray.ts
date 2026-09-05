const EMPTY: readonly unknown[] = [];

/**
 * A referentially-stable empty array for Zustand selector fallbacks
 * (`s.byId[id] ?? emptyArray()`). A `?? []` literal inside a selector body
 * creates a new array every time React's `useSyncExternalStore` re-invokes
 * it to check for tearing, which never resolves to a stable snapshot and
 * throws "Maximum update depth exceeded" — see TripDetailScreen's crash.
 */
export function emptyArray<T>(): T[] {
  return EMPTY as T[];
}
