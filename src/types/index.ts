export interface User {
  _id: string;
  email: string;
  name?: string;
  authProvider: 'local' | 'google' | 'github';
  approval_status: 'pending' | 'approved' | 'rejected';
  isAdmin?: boolean;
  role?: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgrammingLanguage {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyTopic {
  _id: string;
  languageId: string | { _id: string; name: string };
  languageName?: string;
  topic: string;
  date: string;
  questionLevel?: 'Easy' | 'Medium' | 'Hard';
  questionCount?: number;
  createdBy?: { _id: string; email: string };
  completed?: boolean;
  score?: number | null;
  totalQuestions?: number | null;
  submittedAt?: string | null;
  error?: string;
}

export interface Question {
  _id: string;
  dailyTopicId: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExamResult {
  _id: string;
  userId: string;
  dailyTopicId: DailyTopic;
  score: number;
  totalQuestions: number;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  questionId: string;
  selectedOption: string;
  isCorrect?: boolean;
}

export interface DetailedUserResponse {
  _id: string;
  userId: string;
  dailyTopicId: string;
  answers: {
    questionId: string;
    selectedOption: string;
    isCorrect: boolean;
    correctAnswer: string;
    explanation: string;
  }[];
  score: number;
  totalQuestions: number;
  completed: boolean;
  submittedAt: string;
}

export interface AssessmentDetails {
  _id: string;
  dailyTopic: DailyTopic;
  score: number;
  totalQuestions: number;
  submittedAt: string;
  questions: {
    _id: string;
    questionText: string;
    options: string[];
    correctAnswer: string;
    explanation?: string;
    userSelectedOption: string | null;
    isCorrect: boolean;
  }[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
}

export interface ExamStartResponse {
  topic: string;
  language: string;
  dailyTopicId: string;
  questions: Question[];
}