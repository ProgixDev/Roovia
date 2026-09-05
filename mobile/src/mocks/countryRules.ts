export interface CountryRules {
  country: string;
  wildCampingLegal: "autorisé" | "toléré" | "interdit";
  wildCampingNote: string;
  tollsNote: string;
  lezZones: boolean;
  lezNote: string;
}

/** France/Spain/Italy/Portugal only, matching this app's mock corridor — curating the rest is real research work, not a data-shape problem. */
export const COUNTRY_RULES: CountryRules[] = [
  {
    country: "France",
    wildCampingLegal: "toléré",
    wildCampingNote: "Bivouac toléré une nuit hors zones protégées ; stationnement interdit sur la plupart des plages.",
    tollsNote: "Autoroutes à péage sur les grands axes.",
    lezZones: true,
    lezNote: "ZFE dans les grandes métropoles — vignette Crit'Air obligatoire.",
  },
  {
    country: "Espagne",
    wildCampingLegal: "toléré",
    wildCampingNote: "Toléré dans de nombreuses régions, interdit dans certains parcs naturels et sur le littoral protégé.",
    tollsNote: "Péages sur les autoroutes (autopistas), gratuit sur les autovías.",
    lezZones: true,
    lezNote: "Zones à faibles émissions à Madrid et Barcelone — étiquette environnementale requise.",
  },
  {
    country: "Portugal",
    wildCampingLegal: "interdit",
    wildCampingNote: "Interdit sur tout le territoire depuis 2021, sauf terrains dédiés.",
    tollsNote: "Péages électroniques automatiques sur plusieurs axes — dispositif Via Verde recommandé.",
    lezZones: false,
    lezNote: "Pas de zone à faibles émissions généralisée.",
  },
  {
    country: "Italie",
    wildCampingLegal: "interdit",
    wildCampingNote: "Interdit dans la plupart des régions et fortement réglementé ailleurs.",
    tollsNote: "Réseau autoroutier majoritairement payant.",
    lezZones: true,
    lezNote: "ZTL (zones à trafic limité) dans de nombreux centres historiques.",
  },
];

export function rulesFor(destination: string): CountryRules | null {
  const q = destination.toLowerCase();
  return COUNTRY_RULES.find((r) => q.includes(r.country.toLowerCase())) ?? null;
}
