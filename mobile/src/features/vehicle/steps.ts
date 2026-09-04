const KEYS = ["type", "dimensions", "equipment", "autonomy", "needs"] as const;
export type VehicleStepKey = (typeof KEYS)[number];

/**
 * Unlike the traveler wizard, every vehicle type goes through the same 5
 * steps — no branching, so this is a flat lookup rather than a filtered
 * list. `id` is baked into every route because a brand-new vehicle doesn't
 * get a real id until the "type" step commits it (see the "new" sentinel
 * in `app/profile/vehicles/[id]/type.tsx`).
 */
export function vehicleStepInfo(id: string, key: VehicleStepKey) {
  const index = KEYS.indexOf(key);
  const route = (k: VehicleStepKey) => `/profile/vehicles/${id}/${k}`;
  return {
    step: index,
    stepCount: KEYS.length,
    nextRoute: index < KEYS.length - 1 ? route(KEYS[index + 1]) : null,
    backRoute: index > 0 ? route(KEYS[index - 1]) : null,
  };
}
