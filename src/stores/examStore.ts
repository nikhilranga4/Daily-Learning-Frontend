import { create } from 'zustand';
import { Question } from '../types';

interface Answer {
  questionId: string;
  selectedOption: string;
}

interface ExamStore {
  questions: Question[];
  userAnswers: Answer[];
  timeRemaining: number;
  examStarted: boolean;
  currentQuestion: number;
  setCurrentQuestion: (index: number) => void;
  updateAnswer: (answer: Answer) => void;
  setTimeRemaining: (time: number) => void;
  startExam: (questions: Question[]) => void;
  completeExam: () => void;
  resetExam: () => void;
}

export const useExamStore = create<ExamStore>((set) => ({
  questions: [],
  userAnswers: [],
  timeRemaining: 1800, // 30 minutes
  examStarted: false,
  currentQuestion: 0,
  setCurrentQuestion: (index: number) => set({ currentQuestion: index }),
  updateAnswer: (answer: Answer) => 
    set((state: ExamStore) => ({
      userAnswers: [
        ...state.userAnswers.filter(a => a.questionId !== answer.questionId),
        answer
      ]
    })),
  setTimeRemaining: (time: number) => set({ timeRemaining: time }),
  startExam: (questions: Question[]) => set({ 
    questions, 
    examStarted: true,
    timeRemaining: 1800,
    currentQuestion: 0,
    userAnswers: []
  }),
  completeExam: () => set({ examStarted: false }),
  resetExam: () => set({
    questions: [],
    userAnswers: [],
    timeRemaining: 1800,
    examStarted: false,
    currentQuestion: 0
  })
}));
