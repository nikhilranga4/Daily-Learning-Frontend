import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Calendar, Target, TrendingUp, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { examApi } from '../../lib/api';
import { ExamResult } from '../../types';
import toast from 'react-hot-toast';

interface ExamResultsProps {
  currentScore?: number;
  currentTotal?: number;
  onBack: () => void;
}

export const ExamResults: React.FC<ExamResultsProps> = ({
  currentScore,
  currentTotal,
  onBack
}) => {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await examApi.getUserResults();
      setResults(response.data);
    } catch {
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'bg-green-100 text-green-800';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const averageScore = results.length > 0
    ? results.reduce((acc, result) => acc + (result.score / result.totalQuestions) * 100, 0) / results.length
    : 0;

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Exam Results
          </h1>
          <p className="text-gray-600 mt-2">
            Track your learning progress and performance
          </p>
        </div>

        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Current Result (if available) */}
      {currentScore !== undefined && currentTotal !== undefined && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8"
        >
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="text-center py-8">
              <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Latest Result
              </h2>
              <div className="text-4xl font-bold mb-2">
                <span className={getScoreColor(currentScore, currentTotal)}>
                  {currentScore}
                </span>
                <span className="text-gray-400">/{currentTotal}</span>
              </div>
              <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getScoreBadge(currentScore, currentTotal)}`}>
                {Math.round((currentScore / currentTotal) * 100)}% Score
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="text-center py-6">
            <Target className="w-8 h-8 mx-auto text-blue-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              Total Exams
            </h3>
            <p className="text-2xl font-bold text-blue-600">{results.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center py-6">
            <TrendingUp className="w-8 h-8 mx-auto text-green-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              Average Score
            </h3>
            <p className="text-2xl font-bold text-green-600">
              {averageScore.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center py-6">
            <Calendar className="w-8 h-8 mx-auto text-purple-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              This Month
            </h3>
            <p className="text-2xl font-bold text-purple-600">
              {results.filter(result =>
                new Date(result.submittedAt).getMonth() === new Date().getMonth()
              ).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Results History */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-gray-800">Recent Results</h2>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No Results Yet
              </h3>
              <p className="text-gray-500">
                Take your first exam to see results here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result, index) => (
                <motion.div
                  key={result._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {result.dailyTopicId.topic}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {new Date(result.submittedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold">
                      <span className={getScoreColor(result.score, result.totalQuestions)}>
                        {result.score}
                      </span>
                      <span className="text-gray-400">/{result.totalQuestions}</span>
                    </div>
                    <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getScoreBadge(result.score, result.totalQuestions)}`}>
                      {Math.round((result.score / result.totalQuestions) * 100)}%
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};