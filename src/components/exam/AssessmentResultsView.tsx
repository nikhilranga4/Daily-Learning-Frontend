import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Trophy,
  Calendar,
  Clock,
  BookOpen,
  Target,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { examApi } from '../../lib/api';
import { AssessmentDetails, DailyTopic } from '../../types';
import toast from 'react-hot-toast';

interface AssessmentResultsViewProps {
  dailyTopic: DailyTopic;
  onBack: () => void;
}

export const AssessmentResultsView: React.FC<AssessmentResultsViewProps> = ({
  dailyTopic,
  onBack
}) => {
  const [assessmentDetails, setAssessmentDetails] = useState<AssessmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAssessmentDetails();
  }, [dailyTopic._id]);

  const fetchAssessmentDetails = async () => {
    try {
      setLoading(true);
      const response = await examApi.getAssessmentDetails(dailyTopic._id);
      setAssessmentDetails(response.data);
    } catch {
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

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!assessmentDetails) {
    return (
      <div className="text-center py-12">
        <Target className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          No Details Available
        </h3>
        <p className="text-gray-500">
          Unable to load assessment details.
        </p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Calendar
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Calendar
        </Button>
      </div>

      {/* Assessment Header */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Assessment Results</h1>
              <div className="flex items-center space-x-4 text-gray-600 mb-2">
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  <span className="font-medium">{dailyTopic.languageName}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{new Date(dailyTopic.date).toLocaleDateString()}</span>
                </div>
              </div>
              <p className="text-gray-700 font-medium">{dailyTopic.topic}</p>
            </div>
            <Trophy className="w-12 h-12 text-yellow-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold mb-1">
                <span className={getScoreColor(assessmentDetails.score, assessmentDetails.totalQuestions)}>
                  {assessmentDetails.score}
                </span>
                <span className="text-gray-400">/{assessmentDetails.totalQuestions}</span>
              </div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getScoreBadge(assessmentDetails.score, assessmentDetails.totalQuestions)}`}>
                {Math.round((assessmentDetails.score / assessmentDetails.totalQuestions) * 100)}% Score
              </div>
            </div>
            <div className="text-right text-gray-600">
              <div className="flex items-center mb-1">
                <Clock className="w-4 h-4 mr-1" />
                <span className="text-sm">Submitted on</span>
              </div>
              <span className="text-sm font-medium">
                {new Date(assessmentDetails.submittedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-bold text-gray-800">Performance Summary</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-700 mb-1">
                {assessmentDetails.questions.filter(q => q.isCorrect).length}
              </div>
              <div className="text-sm text-green-600 font-medium">Correct Answers</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-700 mb-1">
                {assessmentDetails.questions.filter(q => !q.isCorrect).length}
              </div>
              <div className="text-sm text-red-600 font-medium">Incorrect Answers</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-700 mb-1">
                {Math.round((assessmentDetails.score / assessmentDetails.totalQuestions) * 100)}%
              </div>
              <div className="text-sm text-blue-600 font-medium">Accuracy Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions and Answers */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-gray-800">Questions & Answers</h2>
          <p className="text-gray-600">Review your responses and see the correct answers with explanations</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assessmentDetails.questions.map((question, index) => (
              <Card key={question._id} className={`border-l-4 ${question.isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                          Question {index + 1}
                        </span>
                        <div className="flex items-center space-x-2">
                          {question.isCorrect ? (
                            <>
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <span className="text-sm font-medium text-green-700">Correct</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-5 h-5 text-red-600" />
                              <span className="text-sm font-medium text-red-700">Incorrect</span>
                            </>
                          )}
                        </div>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800 leading-relaxed">
                        {question.questionText}
                      </h4>

                      {/* Quick Answer Preview */}
                      <div className="mt-3 text-sm text-gray-600">
                        <span className="font-medium">Your answer: </span>
                        <span className={question.isCorrect ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                          {question.userSelectedOption && question.userSelectedOption.trim() !== ''
                            ? question.userSelectedOption
                            : 'No answer selected'}
                        </span>
                        {!question.isCorrect && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="font-medium">Correct: </span>
                            <span className="text-green-700 font-medium">{question.correctAnswer}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleQuestionExpansion(question._id)}
                      className="ml-4 flex items-center space-x-1"
                    >
                      <span className="text-xs">
                        {expandedQuestions.has(question._id) ? 'Hide' : 'Show'} Details
                      </span>
                      {expandedQuestions.has(question._id) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>

                {expandedQuestions.has(question._id) && (
                  <CardContent>
                    <div className="space-y-4">
                      {/* User's Answer Summary */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h6 className="font-semibold text-gray-700 mb-1">Your Answer:</h6>
                            <p className={`font-medium ${question.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                              {question.userSelectedOption && question.userSelectedOption.trim() !== ''
                                ? question.userSelectedOption
                                : 'No answer selected'}
                            </p>
                          </div>
                          <div>
                            <h6 className="font-semibold text-gray-700 mb-1">Correct Answer:</h6>
                            <p className="font-medium text-green-700">
                              {question.correctAnswer}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* All Options */}
                      <div className="space-y-2">
                        <h6 className="font-semibold text-gray-700 mb-2">All Options:</h6>
                        {question.options.map((option, optionIndex) => {
                          const isCorrect = option === question.correctAnswer;
                          const isUserSelected = question.userSelectedOption && option === question.userSelectedOption;

                          let optionStyle = 'border-gray-200 bg-gray-50 text-gray-700';
                          let badges = [];

                          if (isCorrect && isUserSelected) {
                            // User selected the correct answer
                            optionStyle = 'border-green-500 bg-green-50 text-green-800';
                            badges.push(
                              <span key="correct" className="text-xs bg-green-600 text-white px-2 py-1 rounded mr-1">
                                ✓ Correct
                              </span>
                            );
                            badges.push(
                              <span key="your" className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                                Your Answer
                              </span>
                            );
                          } else if (isCorrect) {
                            // Correct answer but user didn't select it
                            optionStyle = 'border-green-500 bg-green-50 text-green-800';
                            badges.push(
                              <span key="correct" className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                                ✓ Correct Answer
                              </span>
                            );
                          } else if (isUserSelected) {
                            // User selected wrong answer
                            optionStyle = 'border-red-500 bg-red-50 text-red-800';
                            badges.push(
                              <span key="your" className="text-xs bg-red-600 text-white px-2 py-1 rounded">
                                ✗ Your Answer
                              </span>
                            );
                          }

                          return (
                            <div
                              key={optionIndex}
                              className={`p-3 rounded-lg border-2 ${optionStyle}`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{option}</span>
                                <div className="flex items-center space-x-1">
                                  {badges}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {question.explanation && question.explanation.trim() !== '' ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h6 className="font-semibold text-blue-800 mb-2 flex items-center">
                            <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs mr-2">
                              i
                            </span>
                            Explanation:
                          </h6>
                          <p className="text-blue-700 leading-relaxed">{question.explanation}</p>
                        </div>
                      ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <p className="text-gray-600 italic text-center">
                            No explanation available for this question.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
