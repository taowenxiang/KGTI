import { create } from 'zustand';
import type { Question, TestAnswer } from '@shared/types';

interface TestState {
  templateId: string | null;
  questions: Question[];
  answers: TestAnswer[];
  currentIndex: number;
  isSubmitting: boolean;
  resultId: string | null;
  setTemplateId: (id: string) => void;
  setQuestions: (questions: Question[]) => void;
  answerQuestion: (questionId: string, optionIndex: number) => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  setSubmitting: (v: boolean) => void;
  setResultId: (id: string | null) => void;
  reset: () => void;
}

export const useTestStore = create<TestState>((set, get) => ({
  templateId: null,
  questions: [],
  answers: [],
  currentIndex: 0,
  isSubmitting: false,
  resultId: null,
  setTemplateId: (id) => set({ templateId: id }),
  setQuestions: (questions) => set({ questions }),
  answerQuestion: (questionId, optionIndex) => {
    const answers = [...get().answers];
    const idx = answers.findIndex((a) => a.questionId === questionId);
    if (idx >= 0) {
      answers[idx] = { questionId, optionIndex };
    } else {
      answers.push({ questionId, optionIndex });
    }
    set({ answers });
  },
  goToQuestion: (index) => set({ currentIndex: index }),
  nextQuestion: () => {
    const { currentIndex, questions } = get();
    if (currentIndex < questions.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    }
  },
  prevQuestion: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 });
    }
  },
  setSubmitting: (v) => set({ isSubmitting: v }),
  setResultId: (id) => set({ resultId: id }),
  reset: () =>
    set({
      templateId: null,
      questions: [],
      answers: [],
      currentIndex: 0,
      isSubmitting: false,
      resultId: null,
    }),
}));
