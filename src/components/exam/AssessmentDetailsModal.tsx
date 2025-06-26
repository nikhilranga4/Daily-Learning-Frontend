import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Trophy, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  ChevronDown,
  ChevronUp,
  Target,
  BookOpen
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { examApi } from '../../lib/api';
import { AssessmentDetails, DailyTopic } from '../../types';
import toast from 'react-hot-toast';

interface AssessmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyTopic: DailyTopic;
}

export const AssessmentDetailsModal: React.FC<AssessmentDetailsModalProps> = ({
  isOpen,
  onClose,
  dailyTopic
}) => {
  const [assessmentDetails, setAssessmentDetails] = useState<AssessmentDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen && dailyTopic._id) {
      fetchAssessmentDetails();
    }
  }, [isOpen, dailyTopic._id]);

  const fetchAssessmentDetails = async () => {
    try {
      setLoading(true);
      const response = await examApi.getAssessmentDetails(dailyTopic._id);
      setAssessmentDetails(response.data);
    } catch (error) {
      console.error('Error fetching assessment details:', error);
      toast.error('Failed to load assessment details');
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestionExpansion = (questionId: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'bg-green-100 text-green-800 border-green-300';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-2">Assessment Results</h2>
                <div className="flex items-center space-x-4 text-blue-100">
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-1" />
                    <span>{dailyTopic.languageName}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{new Date(dailyTopic.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <p className="text-blue-100 mt-1">{dailyTopic.topic}</p>
              </div>
              <Button
                variant="outline"
                onClick={onClose}
                className="text-white border-white hover:bg-white hover:text-blue-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : assessmentDetails ? (
              <div className="p-6">
                {/* Score Summary */}
                <Card className="mb-6">
                  <CardContent className="text-center py-8">
                    <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
                    <div className="text-4xl font-bold mb-2">
                      <span className={getScoreColor(assessmentDetails.score, assessmentDetails.totalQuestions)}>
                        {assessmentDetails.score}
                      </span>
                      <span className="text-gray-400">/{assessmentDetails.totalQuestions}</span>
                    </div>
                    <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${getScoreBadge(assessmentDetails.score, assessmentDetails.totalQuestions)}`}>
                      {Math.round((assessmentDetails.score / assessmentDetails.totalQuestions) * 100)}% Score
                    </div>
                    <div className="flex items-center justify-center mt-4 text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>Submitted on {new Date(assessmentDetails.submittedAt).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Questions and Answers */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Questions & Answers</h3>
                  
                  {assessmentDetails.questions.map((question, index) => (
                    <Card key={question._id} className="border-l-4 border-l-gray-300">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-medium">
                                Question {index + 1}
                              </span>
                              {question.isCorrect ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-600" />
                              )}
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800">
                              {question.questionText}
                            </h4>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleQuestionExpansion(question._id)}
                            className="ml-4"
                          >
                            {expandedQuestions.has(question._id) ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </CardHeader>
                      
                      <AnimatePresence>
                        {expandedQuestions.has(question._id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <CardContent>
                              <div className="space-y-3">
                                {/* Options */}
                                <div className="space-y-2">
                                  {question.options.map((option, optionIndex) => (
                                    <div
                                      key={optionIndex}
                                      className={`p-3 rounded-lg border-2 ${
                                        option === question.correctAnswer
                                          ? 'border-green-500 bg-green-50 text-green-800'
                                          : option === question.userSelectedOption && !question.isCorrect
                                          ? 'border-red-500 bg-red-50 text-red-800'
                                          : 'border-gray-200 bg-gray-50'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span>{option}</span>
                                        <div className="flex items-center space-x-2">
                                          {option === question.correctAnswer && (
                                            <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                                              Correct
                                            </span>
                                          )}
                                          {option === question.userSelectedOption && (
                                            <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                                              Your Answer
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Explanation */}
                                {question.explanation && (
                                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h5 className="font-semibold text-blue-800 mb-2">Explanation:</h5>
                                    <p className="text-blue-700">{question.explanation}</p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No Details Available
                </h3>
                <p className="text-gray-500">
                  Unable to load assessment details.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
