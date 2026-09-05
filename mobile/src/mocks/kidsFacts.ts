export type FactCategory = "animal" | "plante" | "monument";

export interface KidFact {
  id: string;
  region: string;
  minAge: number;
  maxAge: number;
  text: string;
  category: FactCategory;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface RegionQuiz {
  region: string;
  questions: QuizQuestion[];
}

export const KID_FACTS: KidFact[] = [
  { id: "f1", region: "Espagne", minAge: 4, maxAge: 7, text: "En Espagne, il y a des flamants roses tout roses à cause des crevettes qu'ils mangent !", category: "animal" },
  { id: "f2", region: "Espagne", minAge: 8, maxAge: 12, text: "Le loup ibérique vit encore dans le nord de l'Espagne — c'est un cousin sauvage du chien.", category: "animal" },
  { id: "f3", region: "Espagne", minAge: 4, maxAge: 7, text: "Le olivier peut vivre plus de 1000 ans, presque aussi vieux qu'un château fort !", category: "plante" },
  { id: "f4", region: "Espagne", minAge: 8, maxAge: 12, text: "La Sagrada Familia à Barcelone est en construction depuis plus de 140 ans !", category: "monument" },

  { id: "f5", region: "France", minAge: 4, maxAge: 7, text: "La marmotte des Alpes siffle très fort pour prévenir ses amies d'un danger.", category: "animal" },
  { id: "f6", region: "France", minAge: 8, maxAge: 12, text: "Le bouquetin peut sauter sur des rochers presque à la verticale grâce à ses sabots spéciaux.", category: "animal" },
  { id: "f7", region: "France", minAge: 4, maxAge: 7, text: "L'edelweiss est une fleur des montagnes tellement rare qu'il ne faut jamais la cueillir.", category: "plante" },
  { id: "f8", region: "France", minAge: 8, maxAge: 12, text: "Le Mont-Blanc grandit et rétrécit chaque année selon la neige qui s'accumule dessus !", category: "monument" },

  { id: "f9", region: "Portugal", minAge: 4, maxAge: 7, text: "Le coq de Barcelos est le symbole porte-bonheur du Portugal.", category: "animal" },
  { id: "f10", region: "Portugal", minAge: 8, maxAge: 12, text: "Le liège des bouchons de bouteille vient de l'écorce du chêne-liège portugais.", category: "plante" },
];

export const REGION_QUIZZES: RegionQuiz[] = [
  {
    region: "Espagne",
    questions: [
      { id: "q1", question: "De quelle couleur sont les flamants roses en Espagne ?", options: ["Bleus", "Roses", "Verts"], correctIndex: 1 },
      { id: "q2", question: "Quel monument est en construction depuis plus de 140 ans ?", options: ["La Sagrada Familia", "La Tour Eiffel", "Le Colisée"], correctIndex: 0 },
      { id: "q3", question: "Combien de temps peut vivre un olivier ?", options: ["10 ans", "100 ans", "Plus de 1000 ans"], correctIndex: 2 },
    ],
  },
  {
    region: "France",
    questions: [
      { id: "q4", question: "Comment la marmotte prévient-elle ses amies d'un danger ?", options: ["Elle siffle", "Elle chante", "Elle court en cercle"], correctIndex: 0 },
      { id: "q5", question: "Grâce à quoi le bouquetin saute-t-il sur les rochers ?", options: ["Ses ailes", "Ses sabots spéciaux", "Sa queue"], correctIndex: 1 },
      { id: "q6", question: "Que ne faut-il jamais faire avec l'edelweiss ?", options: ["La cueillir", "La regarder", "La photographier"], correctIndex: 0 },
    ],
  },
  {
    region: "Portugal",
    questions: [
      { id: "q7", question: "Quel est le symbole porte-bonheur du Portugal ?", options: ["Le coq de Barcelos", "Le lion", "L'aigle"], correctIndex: 0 },
      { id: "q8", question: "D'où vient le liège des bouchons de bouteille ?", options: ["Du sapin", "Du chêne-liège", "Du bambou"], correctIndex: 1 },
    ],
  },
];

export function factsFor(region: string, age: number): KidFact[] {
  return KID_FACTS.filter((f) => f.region === region && age >= f.minAge && age <= f.maxAge);
}

export function quizFor(region: string): RegionQuiz | null {
  return REGION_QUIZZES.find((q) => q.region === region) ?? null;
}
