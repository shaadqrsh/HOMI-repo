import { create } from "zustand";

export interface QuestionLoadingState {
  loading: Record<string, boolean>;
  changeLoading: (id: string, loading: boolean) => void;
}

const useQuestionLoading = create<QuestionLoadingState>((set) => ({
  loading: {},

  changeLoading: (id, loading) => {
    set((state) => ({
      loading: {
        ...state.loading,
        [id]: loading,
      },
    }));
  },
}));

export default useQuestionLoading;
