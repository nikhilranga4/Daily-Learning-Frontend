import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { useExamStore } from '../../store/useExamStore';
import { examApi } from '../../lib/api';
import toast from 'react-hot-toast';
import { Question } from '../../types';

interface ApiExamStartResponse {
  topic: string;
  language: string;
  dailyTopicId: string;
  questions: {
    _id: string;
    text: string;
    options: string[];
    correctAnswer?: string;
    explanation?: string;
    difficulty?: string;
  }[];
}

interface ExamStartResponse {
  topic: string;
  language: string;
  dailyTopicId: string;
  questions: Question[];
}

interface ExamInterfaceProps {
  dailyTopicId: string;
  onExamComplete: (score: number, total: number) => void;
}

const ExamInterface: React.FC<ExamInterfaceProps> = ({
  dailyTopicId,
  onExamComplete
}) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [examData, setExamData] = useState<ExamStartResponse | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');

  const {
    questions,
    userAnswers,
    timeRemaining,
    examStarted,
    setCurrentQuestion,
    updateAnswer,
    setTimeRemaining,
    startExam,
    completeExam,
    currentQuestion
  } = useExamStore();

  // Submit exam function
  const handleSubmitExam = useCallback(async () => {
    if (submitting) return; // Prevent double submission

    try {
      if (!examData?.dailyTopicId) {
        throw new Error('Missing dailyTopicId');
      }

      setSubmitting(true);
      toast.loading('Validating your answers...', { id: 'exam-submit' });

      // Add a small delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 1500));

      const response = await examApi.submitExam(
        examData.dailyTopicId,
        questions.map((q: Question) => ({
          questionId: q._id,
          selectedOption: userAnswers.find(
            (a: { questionId: string }) => a.questionId === q._id
          )?.selectedOption || ''
        }))
      );

      toast.success('Assessment completed! Calculating results...', { id: 'exam-submit' });

      // Add another small delay before showing results
      await new Promise(resolve => setTimeout(resolve, 1000));

      completeExam();
      onExamComplete(response.data.score, response.data.totalQuestions);
      toast.success('Results ready!', { id: 'exam-submit' });
    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit exam';
      toast.error(errorMessage, { id: 'exam-submit' });
    } finally {
      setSubmitting(false);
    }
  }, [examData, questions, userAnswers, completeExam, onExamComplete, submitting]);

  // Initialize exam
  const initializeExam = useCallback(async () => {
    if (examData) return; // Prevent re-initialization if exam data already exists

    try {
      const response = await examApi.startExam(dailyTopicId);

      // Type assertion to match backend response
      const apiData = response.data as ApiExamStartResponse;

      if (!apiData.dailyTopicId) {
        throw new Error('Missing dailyTopicId in response');
      }

      const mappedQuestions: Question[] = apiData.questions.map(q => ({
        _id: q._id,
        dailyTopicId: apiData.dailyTopicId,
        questionText: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer || q.options[0],
        explanation: q.explanation || '',
        difficulty: q.difficulty || 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      const examResponse: ExamStartResponse = {
        topic: apiData.topic,
        language: apiData.language,
        dailyTopicId: apiData.dailyTopicId,
        questions: mappedQuestions
      };

      setExamData(examResponse);
      startExam(mappedQuestions);
    } catch (error) {
      toast.error('Failed to start exam');
      console.error('Exam init error:', error);
    } finally {
      setLoading(false);
    }
  }, [dailyTopicId, startExam, examData]);

  useEffect(() => {
    initializeExam();
  }, [initializeExam]);

  // Timer effect
  useEffect(() => {
    if (examStarted && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (examStarted && timeRemaining === 0) {
      handleSubmitExam();
    }
  }, [timeRemaining, examStarted, setTimeRemaining, handleSubmitExam]);

  // Update selected answer when question changes
  useEffect(() => {
    const currentAnswer = userAnswers.find(
      (answer: { questionId: string; selectedOption: string }) =>
        answer.questionId === questions[currentQuestion]?._id
    );
    setSelectedOption(currentAnswer?.selectedOption || '');
  }, [currentQuestion, userAnswers, questions]);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    updateAnswer(currentQuestion, {
      questionId: questions[currentQuestion]._id,
      selectedOption: option
    });
  };



  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };



  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading || !examStarted) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4"
    >
      {/* Submission Overlay */}
      {submitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center max-w-md mx-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Processing Your Assessment
            </h3>
            <p className="text-gray-600">
              Please wait while we validate your answers and calculate your score...
            </p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Assessment
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end space-x-4">
            <div className="flex items-center text-red-600">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="font-mono text-base sm:text-lg font-semibold">{formatTime(timeRemaining)}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-500">Progress</span>
            <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="mb-6">
            <CardHeader className="p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 leading-relaxed">
                {currentQ.questionText}
              </h2>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.995 }}
                    onClick={() => handleOptionSelect(option)}
                    className={`w-full p-3 sm:p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                      selectedOption === option
                        ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-sm'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 mt-0.5 flex-shrink-0 ${
                        selectedOption === option
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {selectedOption === option && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                        )}
                      </div>
                      <span className="text-sm sm:text-base leading-relaxed">{option}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>



      {/* Navigation */}
      <div className="space-y-4 mt-8">
        {/* Question Numbers - Responsive Grid */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Questions</h3>
          <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 xl:grid-cols-20 gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                  index === currentQuestion
                    ? 'bg-blue-600 text-white shadow-md'
                    : userAnswers.some(answer => questions[index] && answer.questionId === questions[index]._id)
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
                }`}
                title={`Question ${index + 1}${userAnswers.some(answer => questions[index] && answer.questionId === questions[index]._id) ? ' (Answered)' : ''}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 0}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="hidden sm:inline">Question</span>
            <span className="font-medium">{currentQuestion + 1}</span>
            <span>of</span>
            <span className="font-medium">{questions.length}</span>
          </div>

          {currentQuestion === questions.length - 1 ? (
            <Button
              onClick={handleSubmitExam}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="hidden sm:inline">Submitting...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                <>
                  <span>Submit</span>
                  <span className="hidden sm:inline">Exam</span>
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              disabled={currentQuestion === questions.length - 1}
              className="flex items-center space-x-2"
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">→</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ExamInterface;