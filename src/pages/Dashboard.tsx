import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useExamStore } from '../store/useExamStore';
import { Layout } from '../components/layout/Layout';
import { CalendarView } from '../components/dashboard/CalendarView';
import { AssessmentResultsView } from '../components/exam/AssessmentResultsView';
import { DailyKnowledge } from '../components/knowledge/DailyKnowledge';
import { KnowledgeContentViewer } from '../components/knowledge/KnowledgeContentViewer';
import ExamInterface from '../components/exam/ExamInterface';
import { ExamResults } from '../components/exam/ExamResults';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { ChatButton } from '../components/chat/ChatButton';
import { LLMChat } from '../components/llm/LLMChat';
import { DailyTopic } from '../types';

type ViewType = 'calendar' | 'exam' | 'results' | 'assessment-results' | 'knowledge' | 'knowledge-content' | 'admin' | 'llm-chat';

interface KnowledgeTopic {
  _id: string;
  knowledgeTopic: string;
  contentType: 'Concept' | 'Tutorial' | 'Best Practice' | 'Tips & Tricks' | 'Deep Dive';
  isGenerated: boolean;
  isViewed: boolean;
  generatedAt?: string;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { resetExam } = useExamStore();
  const [currentView, setCurrentView] = useState<ViewType>('calendar');
  const [selectedDailyTopic, setSelectedDailyTopic] = useState<DailyTopic | null>(null);
  const [selectedKnowledgeTopic, setSelectedKnowledgeTopic] = useState<KnowledgeTopic | null>(null);
  const [examScore, setExamScore] = useState<number | undefined>();
  const [examTotal, setExamTotal] = useState<number | undefined>();

  useEffect(() => {
    if (user?.isAdmin) {
      setCurrentView('admin');
    }
  }, [user]);

  const handleAssessmentSelect = (dailyTopic: DailyTopic) => {
    setSelectedDailyTopic(dailyTopic);
    resetExam();
    setCurrentView('exam');
  };

  const handleCompletedAssessmentClick = (dailyTopic: DailyTopic) => {
    setSelectedDailyTopic(dailyTopic);
    setCurrentView('assessment-results');
  };

  const handleKnowledgeSelect = (knowledgeTopic: KnowledgeTopic) => {
    setSelectedKnowledgeTopic(knowledgeTopic);
    setCurrentView('knowledge-content');
  };

  const handleBackToDashboard = () => {
    resetExam();
    setCurrentView('calendar');
    setSelectedDailyTopic(null);
    setSelectedKnowledgeTopic(null);
    setExamScore(undefined);
    setExamTotal(undefined);
  };

  const handleBackToKnowledge = () => {
    setCurrentView('knowledge');
    setSelectedKnowledgeTopic(null);
  };

  const renderView = () => {
    if (user?.isAdmin && currentView === 'admin') {
      return <AdminDashboard />;
    }

    switch (currentView) {
      case 'exam':
        return selectedDailyTopic ? (
          <ExamInterface
            dailyTopicId={selectedDailyTopic._id}
            onExamComplete={(score, total) => {
              setExamScore(score);
              setExamTotal(total);
              setCurrentView('results');
            }}
          />
        ) : (
          <div>Error: No assessment selected</div>
        );
      case 'results':
        return (
          <ExamResults
            currentScore={examScore}
            currentTotal={examTotal}
            onBack={handleBackToDashboard}
          />
        );
      case 'assessment-results':
        return selectedDailyTopic ? (
          <AssessmentResultsView
            dailyTopic={selectedDailyTopic}
            onBack={handleBackToDashboard}
          />
        ) : (
          <div>Error: No assessment selected</div>
        );
      case 'knowledge':
        return (
          <DailyKnowledge
            onKnowledgeSelect={handleKnowledgeSelect}
            onBackToDashboard={handleBackToDashboard}
          />
        );
      case 'knowledge-content':
        return selectedKnowledgeTopic ? (
          <KnowledgeContentViewer
            topic={selectedKnowledgeTopic}
            onBack={handleBackToKnowledge}
          />
        ) : (
          <div>Error: No knowledge topic selected</div>
        );
      case 'llm-chat':
        return user ? (
          <LLMChat
            currentUser={{
              _id: user._id,
              name: user.name || 'User',
              email: user.email,
            }}
            onBack={handleBackToDashboard}
          />
        ) : (
          <div>Error: User not found</div>
        );
      default:
        return (
          <CalendarView
            onAssessmentSelect={handleAssessmentSelect}
            onCompletedAssessmentClick={handleCompletedAssessmentClick}
            onKnowledgeClick={() => setCurrentView('knowledge')}
            onLLMChatClick={() => setCurrentView('llm-chat')}
          />
        );
    }
  };

  return (
    <Layout>
      {renderView()}
      {/* Chat Button - Only show for non-admin users or when not in admin view */}
      {user && (!user.isAdmin || currentView !== 'admin') && (
        <ChatButton
          currentUser={{
            _id: user._id,
            name: user.name || 'User',
            email: user.email,
            isAdmin: user.isAdmin || false,
            profilePicture: user.profilePicture
          }}
        />
      )}
    </Layout>
  );
};