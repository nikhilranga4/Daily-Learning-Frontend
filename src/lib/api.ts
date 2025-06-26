import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
import { AuthResponse, User, ExamResult, DailyTopic, AssessmentDetails } from '../types';

interface ApiDailyTopic {
  _id: string;
  languageId: string;
  languageName?: string;
  topic: string;
  date: string; // YYYY-MM-DD format
  createdBy: { _id: string; email: string };
  error?: string;
}

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }),

  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),

  googleLogin: () => window.open(`${API_URL}/auth/google`, '_self'),

  githubLogin: () => window.open(`${API_URL}/auth/github`, '_self'),
};

// Exam API
export const examApi = {
  getLanguages: () =>
    api.get<{ _id: string; name: string }[]>('/admin/languages'),

  startExam: (dailyTopicId: string) => {
    console.log('Sending exam start request with dailyTopicId:', dailyTopicId);
    return api.post<{
      topic: string;
      language: string;
      dailyTopicId: string;
      questions: Array<{
        _id: string;
        text: string;
        options: string[];
        difficulty: string;
      }>
    }>('/exam/start', { dailyTopicId });
  },

  submitExam: (dailyTopicId: string, answers: { questionId: string; selectedOption: string }[]) => {
    console.log('Submitting exam with:', { dailyTopicId, answers });
    return api.post<{
      score: number;
      totalQuestions: number;
      answers: Array<{
        questionId: string;
        selectedOption: string;
        isCorrect: boolean;
        correctAnswer: string;
        explanation: string;
      }>
    }>('/exam/submit', { dailyTopicId, answers });
  },

  getUserResults: () =>
    api.get<ExamResult[]>('/exam/results'),

  getDailyTopics: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    return api.get<DailyTopic[]>(`/exam/daily-topics?${params.toString()}`);
  },

  getAssessmentDetails: (dailyTopicId: string) =>
    api.get<AssessmentDetails>(`/exam/assessment/${dailyTopicId}`),

  getUserCompletedAssessments: () => {
    console.log('Making API call to get completed assessments');
    return api.get('/exam/user-completed-assessments');
  },
};

// Knowledge API
export const knowledgeApi = {
  getAllKnowledge: () => api.get('/knowledge/today'), // Returns all knowledge (past, present, future)
  getTodaysKnowledge: () => api.get('/knowledge/today'), // Backward compatibility
  generateKnowledge: (knowledgeId: string) => api.post(`/knowledge/generate/${knowledgeId}`),
  getKnowledgeContent: (knowledgeId: string) => api.get(`/knowledge/content/${knowledgeId}`),
  getKnowledgeHistory: () => api.get('/knowledge/history'),
};

// Admin API
export const adminApi = {
  getPendingUsers: () => api.get<User[]>('/admin/users/pending'),
  approveUser: (userId: string) => api.patch(`/admin/users/approve/${userId}`),
  rejectUser: (userId: string) => api.patch(`/admin/users/reject/${userId}`),
  getAllUsers: () => api.get<User[]>('/admin/users/all'),

  // Language Management
  getLanguages: () => api.get<{ _id: string; name: string }[]>('/admin/languages'),
  addLanguage: (data: { name: string }) => api.post('/admin/languages', data),

  // Daily Topic Management
  addDailyTopic: async (data: { languageId: string; topic: string; date: string }) => {
    const res = await api.post<ApiDailyTopic>('/admin/daily-topics', data);
    return res.data;
  },

  getDailyTopics: async () => {
    const res = await api.get<ApiDailyTopic[]>('/admin/daily-topics');
    return res.data;
  },

  updateDailyTopic: async (id: string, data: {
    languageId: string;
    topic: string;
    date: string;
    questionLevel?: 'Easy' | 'Medium' | 'Hard';
    questionCount?: number;
  }) => {
    return api.put(`/admin/daily-topics/${id}`, data);
  },

  deleteDailyTopic: (id: string) => {
    return api.delete(`/admin/daily-topics/${id}`);
  },

  // Daily Knowledge Management
  getDailyKnowledge: async () => {
    const res = await api.get('/admin/daily-knowledge');
    return res.data;
  },

  addDailyKnowledge: async (data: {
    knowledgeTopic: string;
    date: string;
    contentType?: 'Concept' | 'Tutorial' | 'Best Practice' | 'Tips & Tricks' | 'Deep Dive';
  }) => {
    const res = await api.post('/admin/daily-knowledge', data);
    return res.data;
  },

  updateDailyKnowledge: async (id: string, data: {
    knowledgeTopic: string;
    date: string;
    contentType?: 'Concept' | 'Tutorial' | 'Best Practice' | 'Tips & Tricks' | 'Deep Dive';
  }) => {
    return api.put(`/admin/daily-knowledge/${id}`, data);
  },

  deleteDailyKnowledge: (id: string) => {
    return api.delete(`/admin/daily-knowledge/${id}`);
  }
};