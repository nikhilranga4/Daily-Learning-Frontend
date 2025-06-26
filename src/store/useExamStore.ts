import { create } from 'zustand';
import { Question, UserResponse } from '../types';

interface ExamState {
  currentQuestion: number;
  questions: Question[];
  userAnswers: UserResponse[];
  timeRemaining: number;
  examStarted: boolean;
  examCompleted: boolean;
  dailyTopicId: string | null;
  setQuestions: (questions: Question[]) => void;
  setCurrentQuestion: (index: number) => void;
  addAnswer: (answer: UserResponse) => void;
  updateAnswer: (questionIndex: number, answer: UserResponse) => void;
  setTimeRemaining: (time: number) => void;
  startExam: (questions: Question[]) => void;
  completeExam: () => void;
  resetExam: () => void;
}

export const useExamStore = create<ExamState>((set, get) => ({
  currentQuestion: 0,
  questions: [],
  userAnswers: [],
  timeRemaining: 0,
  examStarted: false,
  examCompleted: false,
  dailyTopicId: null,

  setQuestions: (questions) => set({ questions }),

  setCurrentQuestion: (index) => set({ currentQuestion: index }),

  addAnswer: (answer) => {
    const { userAnswers } = get();
    set({ userAnswers: [...userAnswers, answer] });
  },

  updateAnswer: (questionIndex, answer) => {
    const { userAnswers } = get();
    const newAnswers = [...userAnswers];
    const existingIndex = newAnswers.findIndex(
      (ans) => ans.questionId === answer.questionId
    );

    if (existingIndex !== -1) {
      newAnswers[existingIndex] = answer;
    } else {
      newAnswers.push(answer);
    }

    set({ userAnswers: newAnswers });
  },

  setTimeRemaining: (time) => set({ timeRemaining: time }),

  startExam: (questions) =>
    set({
      questions,
      examStarted: true,
      examCompleted: false,
      currentQuestion: 0,
      userAnswers: [],
      timeRemaining: 1800 // 30 minutes total
    }),

  completeExam: () => set({ examCompleted: true, examStarted: false }),

  resetExam: () => set({
    currentQuestion: 0,
    questions: [],
    userAnswers: [],
    timeRemaining: 0,
    examStarted: false,
    examCompleted: false,
    dailyTopicId: null,
  }),
}));