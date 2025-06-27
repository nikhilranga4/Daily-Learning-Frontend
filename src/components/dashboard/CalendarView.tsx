import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  Lock,
  Trophy,
  Target,
  Brain,
  BookOpen,
  Bot
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { AssessmentInfoModal } from './AssessmentInfoModal';
import { examApi } from '../../lib/api';
import { DailyTopic } from '../../types';
import toast from 'react-hot-toast';

interface CalendarViewProps {
  onAssessmentSelect: (dailyTopic: DailyTopic) => void;
  onCompletedAssessmentClick: (dailyTopic: DailyTopic) => void;
  onKnowledgeClick: () => void;
  onLLMChatClick?: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  onAssessmentSelect,
  onCompletedAssessmentClick,
  onKnowledgeClick,
  onLLMChatClick
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyTopics, setDailyTopics] = useState<DailyTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<DailyTopic | null>(null);

  useEffect(() => {
    fetchDailyTopics();
  }, [currentDate]);

  const fetchDailyTopics = async () => {
    try {
      setLoading(true);

      // Get start and end of current month in local timezone
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      const response = await examApi.getDailyTopics(startDate, endDate);
      setDailyTopics(response.data);
    } catch (error) {
      console.error('Error fetching daily topics:', error);
      toast.error('Failed to load daily assessments');
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const getTopicForDate = (day: number) => {
    // Create date string in local timezone to avoid UTC conversion issues
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;

    return dailyTopics.find(topic => topic.date === dateStr);
  };

  const isToday = (day: number) => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const dayStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return todayStr === dayStr;
  };

  const isPastDate = (day: number) => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const dayStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dayStr < todayStr;
  };

  const isFutureDate = (day: number) => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const dayStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dayStr > todayStr;
  };

  const handleDayClick = (day: number) => {
    const topic = getTopicForDate(day);
    if (!topic) return;

    if (topic.completed) {
      // For completed assessments, navigate directly to results
      onCompletedAssessmentClick(topic);
    } else {
      // For non-completed assessments, show the info modal
      setSelectedTopic(topic);
      setShowInfoModal(true);
    }
  };

  const handleStartAssessment = () => {
    if (!selectedTopic) return;

    setShowInfoModal(false);

    if (selectedTopic.completed) {
      onCompletedAssessmentClick(selectedTopic);
    } else {
      onAssessmentSelect(selectedTopic);
    }
  };

  const handleCloseModal = () => {
    setShowInfoModal(false);
    setSelectedTopic(null);
  };

  const getDayStatus = (day: number) => {
    const topic = getTopicForDate(day);
    if (!topic) return 'none';

    if (topic.completed) return 'completed';
    if (isFutureDate(day)) return 'locked';
    if (isPastDate(day)) return 'pending';
    return 'available';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-600" />;
      case 'locked':
        return <Lock className="w-4 h-4 text-gray-400" />;
      case 'available':
        return <Target className="w-4 h-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'pending':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'locked':
        return 'bg-gray-100 border-gray-300 text-gray-500';
      case 'available':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Daily Learning Dashboard
        </h1>
        <p className="text-gray-600 text-lg mb-6">
          Track your daily learning progress and take assessments
        </p>

        {/* Action Buttons */}
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onKnowledgeClick}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Brain className="w-6 h-6 mr-3" />
              <span>Daily Knowledge</span>
              <BookOpen className="w-5 h-5 ml-3" />
            </Button>

            {onLLMChatClick && (
              <Button
                onClick={onLLMChatClick}
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Bot className="w-6 h-6 mr-3" />
                <span>AI Assistant</span>
                <Bot className="w-5 h-5 ml-3" />
              </Button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm text-gray-500">
            <p>Expand your programming knowledge with today's curated content</p>
            {onLLMChatClick && (
              <>
                <span className="hidden sm:inline">•</span>
                <p>Chat with AI for coding help and explanations</p>
              </>
            )}
          </div>
        </motion.div>
      </div>

      <Card className="mb-6 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => navigateMonth('prev')}
              className="flex items-center hover:bg-blue-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <h2 className="text-xl md:text-2xl font-bold text-gray-800 text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>

            <Button
              variant="outline"
              onClick={() => navigateMonth('next')}
              className="flex items-center hover:bg-blue-100 transition-colors"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 md:p-6">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 md:gap-3 mb-4">
            {dayNames.map(day => (
              <div key={day} className="text-center font-bold text-gray-700 py-2 md:py-3 bg-gray-50 rounded-lg text-sm md:text-base">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2 md:gap-3">
            {getDaysInMonth().map((day, index) => {
              if (day === null) {
                return <div key={index} className="h-28 md:h-36 border-2 border-transparent"></div>;
              }

              const topic = getTopicForDate(day);
              const status = getDayStatus(day);
              const isClickable = topic && (status === 'completed' || status === 'available' || status === 'pending');

              return (
                <motion.div
                  key={day}
                  whileHover={isClickable ? { scale: 1.02 } : {}}
                  whileTap={isClickable ? { scale: 0.98 } : {}}
                  className={`
                    h-28 md:h-36 border-2 rounded-lg p-2 md:p-3 transition-all duration-200 relative overflow-hidden
                    ${isToday(day) ? 'ring-2 ring-blue-400' : ''}
                    ${isClickable ? 'cursor-pointer hover:shadow-lg' : 'cursor-default'}
                    ${getStatusColor(status)}
                  `}
                  onClick={() => handleDayClick(day)}
                  title={topic ? `${topic.languageName}: ${topic.topic}` : ''}
                >
                  {/* Day number and status icon */}
                  <div className="flex justify-between items-start mb-1 md:mb-2">
                    <span className="font-bold text-sm md:text-base">{day}</span>
                    {topic && (
                      <div className="flex flex-col items-end">
                        {getStatusIcon(status)}
                        {topic.completed && topic.score !== null && (
                          <div className="text-xs mt-1 bg-white bg-opacity-90 rounded px-1 shadow-sm">
                            <Trophy className="w-3 h-3 inline mr-1" />
                            {topic.score}/{topic.totalQuestions}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Topic content */}
                  {topic && (
                    <div className="space-y-1 flex-1 pb-8">
                      <div className="text-xs md:text-sm font-semibold text-blue-700 leading-tight">
                        {topic.languageName}
                      </div>
                      <div
                        className="text-xs text-gray-800 leading-tight font-medium"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {topic.topic}
                      </div>

                      {/* Status badge - positioned at bottom */}
                      <div className="absolute bottom-1 left-1 right-1">
                        <div className={`text-xs px-2 py-1 rounded text-center font-medium shadow-sm ${
                          status === 'completed' ? 'bg-green-600 text-white' :
                          status === 'available' ? 'bg-blue-600 text-white' :
                          status === 'pending' ? 'bg-orange-600 text-white' :
                          'bg-gray-400 text-white'
                        }`}>
                          {status === 'completed' ? '✓ Done' :
                           status === 'available' ? '▶ Start' :
                           status === 'pending' ? '⏳ Pending' :
                           '🔒 Locked'}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Legend</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-sm">Available Today</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="text-sm">Pending</span>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-gray-400" />
              <span className="text-sm">Locked</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Info Modal */}
      {selectedTopic && (
        <AssessmentInfoModal
          isOpen={showInfoModal}
          onClose={handleCloseModal}
          dailyTopic={selectedTopic}
          onStartAssessment={handleStartAssessment}
        />
      )}
    </motion.div>
  );
};
