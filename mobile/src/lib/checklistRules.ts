import type { PartyComposition } from "../store/travelerProfileStore";
import type { Vehicle } from "../store/vehiclesStore";

export type ChecklistCategory = "documents" | "vehicule" | "equipement" | "bagages";

export interface ChecklistItemSeed {
  id: string;
  label: string;
  category: ChecklistCategory;
}

export const CATEGORY_LABEL: Record<ChecklistCategory, string> = {
  documents: "Documents",
  vehicule: "Véhicule",
  equipement: "Équipement camping-car",
  bagages: "Bagages",
};

const EU_COUNTRIES = ["france", "espagne", "portugal", "italie", "allemagne", "suisse"];

function isInternational(destination: string): boolean {
  const q = destination.toLowerCase();
  return !q.includes("france") && q.trim().length > 0;
}

function crossesBorder(destination: string): boolean {
  const q = destination.toLowerCase();
  return EU_COUNTRIES.some((c) => c !== "france" && q.includes(c));
}

/**
 * A real rules engine, not a fixed list — destination, vehicle equipment,
 * duration, and party composition each add or skip items, same spirit as
 * `lib/budget.ts`: every line traces back to a real input.
 */
export function generateChecklist(input: {
  destination: string;
  nights: number;
  party: PartyComposition | null;
  hasChildren: boolean;
  vehicle: Vehicle | null;
}): ChecklistItemSeed[] {
  const items: ChecklistItemSeed[] = [];
  const add = (id: string, label: string, category: ChecklistCategory) => items.push({ id, label, category });

  add("passport", "Carte d'identité ou passeport", "documents");
  add("insurance", "Attestation d'assurance véhicule", "documents");
  add("license", "Permis de conduire", "documents");
  if (isInternational(input.destination)) {
    add("carte-grise", "Carte grise (à jour de l'adresse)", "documents");
  }
  if (crossesBorder(input.destination)) {
    add("vignette", "Vignettes/péages du pays traversé", "documents");
    add("ethylotest", "Éthylotest (obligatoire dans certains pays)", "documents");
  }

  add("fuel", "Faire le plein avant le départ", "vehicule");
  add("oil", "Vérifier le niveau d'huile", "vehicule");
  add("tires", "Vérifier la pression des pneus", "vehicule");
  add("lights", "Vérifier les feux et ampoules de rechange", "vehicule");
  add("triangle", "Triangle de signalisation + gilet", "vehicule");

  add("water", "Remplir le réservoir d'eau propre", "equipement");
  if (input.vehicle?.equipment.freshWaterTank) {
    add("dump-before", "Vidanger les eaux avant le départ", "equipement");
  }
  if (input.vehicle?.equipment.solar) {
    add("solar-check", "Vérifier le panneau solaire / batterie", "equipement");
  }
  if (input.vehicle?.hookup220V) {
    add("hookup-cable", "Câble électrique 220V", "equipement");
  }
  if (input.nights > 3) {
    add("gas", "Vérifier le niveau de gaz", "equipement");
  }

  add("clothes", "Vêtements adaptés à la météo", "bagages");
  add("chargers", "Chargeurs et batteries externes", "bagages");
  if (input.hasChildren) {
    add("car-seat", "Siège auto / réhausseur", "bagages");
    add("health-record", "Carnet de santé des enfants", "bagages");
    add("activities", "Jeux et activités pour la route", "bagages");
  }
  if (input.party === "friends" || input.party === "family") {
    add("games", "Jeux de société / cartes pour les soirées", "bagages");
  }

  return items;
}
