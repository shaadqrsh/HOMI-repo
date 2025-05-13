import { create } from "zustand";

interface TestState {
  questionIdx: number;
  answers: Record<string, string | null>;
  setQuestionIdx: (idx: number) => void;
  addAnswers: (questionId: string, optionNo: string | null) => void;
}

const useTestStore = create<TestState>((set) => ({
  questionIdx: 0,
  answers: {},

  setQuestionIdx: (idx) => {
    set(() => ({ questionIdx: idx }));
  },
  addAnswers: (questionId, optionNo) => {
    set((state) => ({
      answers: {
        ...state.answers,
        [questionId]: optionNo,
      },
    }));
  },
}));

export default useTestStore;
