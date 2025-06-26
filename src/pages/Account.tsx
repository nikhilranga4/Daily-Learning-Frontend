import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Calendar,
  Trophy,
  BookOpen,
  Clock,
  Target,
  TrendingUp,
  Award,
  ArrowLeft,
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { AssessmentResultsView } from '../components/exam/AssessmentResultsView';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { examApi } from '../lib/api';
import { DailyTopic } from '../types';
import toast from 'react-hot-toast';

interface CompletedAssessment {
  _id: string;
  dailyTopic: DailyTopic;
  score: number;
  totalQuestions: number;
  submittedAt: string;
  percentage: number;
}

export const Account: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [completedAssessments, setCompletedAssessments] = useState<CompletedAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState<DailyTopic | null>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    console.log('Account component mounted, user:', user);
    fetchCompletedAssessments();
  }, [user]); // Added user dependency

  const fetchCompletedAssessments = async () => {
    try {
      setLoading(true);
      console.log('Fetching completed assessments...');
      const response = await examApi.getUserCompletedAssessments();
      console.log('API Response:', response);

      // Handle different response structures
      const assessments = response.data?.data || response.data || [];
      console.log('Processed assessments:', assessments);

      setCompletedAssessments(assessments);
    } catch (error) {
      console.error('Error fetching completed assessments:', error);
      toast.error('Failed to load assessment history');
    } finally {
      setLoading(false);
    }
  };

  const handleAssessmentClick = (assessment: CompletedAssessment) => {
    setSelectedAssessment(assessment.dailyTopic);
    setShowResults(true);
  };

  const handleBackToAccount = () => {
    setShowResults(false);
    setSelectedAssessment(null);
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-100 text-green-800 border-green-300';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getPerformanceStats = () => {
    if (completedAssessments.length === 0) return { total: 0, avgScore: 0, bestScore: 0 };

    const total = completedAssessments.length;
    const avgScore = Math.round(
      completedAssessments.reduce((sum, assessment) => sum + assessment.percentage, 0) / total
    );
    const bestScore = Math.max(...completedAssessments.map(a => a.percentage));

    return { total, avgScore, bestScore };
  };

  if (showResults && selectedAssessment) {
    console.log('Showing assessment results for:', selectedAssessment);
    return (
      <Layout>
        <AssessmentResultsView
          dailyTopic={selectedAssessment}
          onBack={handleBackToAccount}
        />
      </Layout>
    );
  }

  console.log('Rendering Account page, loading:', loading, 'assessments:', completedAssessments.length);

  const stats = getPerformanceStats();

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto p-6"
      >
        {/* Header with Navigation */}
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Button>
        </div>

        {/* User Profile Section */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">My Account</h1>
                <div className="flex items-center space-x-4 text-gray-600 mt-2">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
              <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
              <div className="text-sm text-gray-600">Assessments Completed</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto text-blue-500 mb-2" />
              <div className="text-2xl font-bold text-gray-800">{stats.avgScore}%</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Award className="w-8 h-8 mx-auto text-green-500 mb-2" />
              <div className="text-2xl font-bold text-gray-800">{stats.bestScore}%</div>
              <div className="text-sm text-gray-600">Best Score</div>
            </CardContent>
          </Card>
        </div>

        {/* Assessment History */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-gray-800">Assessment History</h2>
            <p className="text-gray-600">Click on any assessment to view detailed results</p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : completedAssessments.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No Assessments Yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Complete your first daily assessment to see your results here.
                </p>
                <Button
                  onClick={() => navigate('/')}
                  className="flex items-center space-x-2 mx-auto"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Start Your First Assessment</span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedAssessments.map((assessment) => (
                  <motion.div
                    key={assessment._id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className="cursor-pointer"
                      onClick={() => handleAssessmentClick(assessment)}
                    >
                      <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-800 mb-1">
                              {assessment.dailyTopic.languageName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {assessment.dailyTopic.topic}
                            </p>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getScoreBadge(assessment.percentage)}`}>
                            {assessment.percentage}%
                          </div>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Target className="w-4 h-4 mr-1" />
                              <span>Score</span>
                            </div>
                            <span className={`font-medium ${getScoreColor(assessment.percentage)}`}>
                              {assessment.score}/{assessment.totalQuestions}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>Date</span>
                            </div>
                            <span>{new Date(assessment.dailyTopic.date).toLocaleDateString()}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>Completed</span>
                            </div>
                            <span>{new Date(assessment.submittedAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-center text-blue-600 text-sm font-medium">
                            <BookOpen className="w-4 h-4 mr-1" />
                            View Details
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Layout>
  );
};
