import type { Ionicons } from "@expo/vector-icons";

import type { StopKind } from "../../mocks/itineraries";

export const STOP_ICON: Record<StopKind, keyof typeof Ionicons.glyphMap> = {
  visit: "eye-outline",
  activity: "walk-outline",
  sleep_free: "moon-outline",
  sleep_paid: "bed-outline",
  service: "construct-outline",
};

export const STOP_LABEL: Record<StopKind, string> = {
  visit: "Visite",
  activity: "Activité",
  sleep_free: "Étape gratuite",
  sleep_paid: "Étape payante",
  service: "Service",
};
