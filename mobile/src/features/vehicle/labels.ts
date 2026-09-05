import type { FuelType, ToiletType, VehicleType } from "../../store/vehiclesStore";

export const VEHICLE_TYPE_LABEL: Record<VehicleType, string> = {
  // "Van" (plain, unconverted) vs. "Van aménagé" (camper van) — two
  // distinct picker options, not a typo of each other.
  van: "Van aménagé",
  fourgon: "Van",
  camping_car: "Camping-car",
  heavy_truck: "Poids lourd aménagé",
  converted_car: "Voiture aménagée",
};

export const TOILET_LABEL: Record<ToiletType, string> = {
  cassette: "Cassette",
  fixed: "Fixe",
  none: "Aucun",
};

export const FUEL_LABEL: Record<FuelType, string> = {
  diesel: "Diesel",
  petrol: "Essence",
  electric: "Électrique",
  hybrid: "Hybride",
};
