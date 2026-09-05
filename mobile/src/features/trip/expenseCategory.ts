import type { Ionicons } from "@expo/vector-icons";

import type { Expense } from "../../lib/settle";

export const CATEGORY_LABEL: Record<Expense["category"], string> = {
  carburant: "Carburant",
  hebergement: "Hébergement",
  nourriture: "Nourriture",
  activites: "Activités",
  autre: "Autre",
};

export const CATEGORY_ICON: Record<Expense["category"], keyof typeof Ionicons.glyphMap> = {
  carburant: "flash-outline",
  hebergement: "bed-outline",
  nourriture: "restaurant-outline",
  activites: "walk-outline",
  autre: "pricetag-outline",
};
