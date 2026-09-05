import { create } from "zustand";

interface QuizResult {
  regionId: string;
  scoreOutOf5: number;
  badge: string;
}

interface KidsState {
  inKidsMode: boolean;
  quizResults: QuizResult[];
  enterKidsMode(): void;
  exitKidsMode(): void;
  recordQuiz(regionId: string, scoreOutOf5: number, badge: string): void;
}

export const useKidsStore = create<KidsState>((set, get) => ({
  inKidsMode: false,
  quizResults: [],

  enterKidsMode() {
    set({ inKidsMode: true });
  },

  exitKidsMode() {
    set({ inKidsMode: false });
  },

  recordQuiz(regionId, scoreOutOf5, badge) {
    const current = get().quizResults.filter((r) => r.regionId !== regionId);
    set({ quizResults: [...current, { regionId, scoreOutOf5, badge }] });
  },
}));
