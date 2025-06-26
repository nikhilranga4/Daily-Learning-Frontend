import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Brain,
  Clock,
  Star,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Target,
  TrendingUp,
  ArrowLeft,
  Home,
  Calendar,
  Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { knowledgeApi } from '../../lib/api';
import toast from 'react-hot-toast';

interface KnowledgeTopic {
  _id: string;
  knowledgeTopic: string;
  contentType: 'Concept' | 'Tutorial' | 'Best Practice' | 'Tips & Tricks' | 'Deep Dive';
  date: string;
  isGenerated: boolean;
  isViewed: boolean;
  generatedAt?: string;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  canGenerate: boolean;
  canViewToday: boolean;
  canGenerateMissed?: boolean;
  showInPast?: boolean;
  showAsMissed?: boolean;
}

interface DailyKnowledgeProps {
  onKnowledgeSelect: (topic: KnowledgeTopic) => void;
  onBackToDashboard: () => void;
}

export const DailyKnowledge: React.FC<DailyKnowledgeProps> = ({
  onKnowledgeSelect,
  onBackToDashboard
}) => {
  const [knowledgeTopics, setKnowledgeTopics] = useState<KnowledgeTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllKnowledge();
  }, []);

  const fetchAllKnowledge = async () => {
    try {
      setLoading(true);
      const response = await knowledgeApi.getTodaysKnowledge();
      setKnowledgeTopics(response.data.data || []);
    } catch (error) {
      console.error('Error fetching knowledge topics:', error);
      toast.error('Failed to load knowledge topics');
    } finally {
      setLoading(false);
    }
  };

  // Categorize topics
  const todayTopics = knowledgeTopics.filter(topic => topic.isToday);
  const pastTopics = knowledgeTopics.filter(topic =>
    topic.showInPast ||
    (topic.isPast && topic.isGenerated) ||
    (topic.isPast && topic.generatedAt) // Include any past topic that has been generated
  );
  const missedTopics = knowledgeTopics.filter(topic =>
    topic.showAsMissed ||
    (topic.isPast && !topic.isGenerated && !topic.generatedAt) // Only show if truly not generated
  );
  const futureTopics = knowledgeTopics.filter(topic => topic.isFuture);

  console.log('All topics:', knowledgeTopics);
  console.log('Today topics:', todayTopics);
  console.log('Past topics:', pastTopics);
  console.log('Missed topics:', missedTopics);
  console.log('Future topics:', futureTopics);



  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'Concept': return <Brain className="w-5 h-5" />;
      case 'Tutorial': return <BookOpen className="w-5 h-5" />;
      case 'Best Practice': return <Star className="w-5 h-5" />;
      case 'Tips & Tricks': return <Lightbulb className="w-5 h-5" />;
      case 'Deep Dive': return <Target className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const getContentTypeColor = (contentType: string) => {
    switch (contentType) {
      case 'Concept': return 'text-blue-600 bg-blue-50';
      case 'Tutorial': return 'text-purple-600 bg-purple-50';
      case 'Best Practice': return 'text-green-600 bg-green-50';
      case 'Tips & Tricks': return 'text-orange-600 bg-orange-50';
      case 'Deep Dive': return 'text-indigo-600 bg-indigo-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (knowledgeTopics.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Brain className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No Knowledge Topics Today
          </h3>
          <p className="text-gray-500">
            Check back tomorrow for new learning content!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={onBackToDashboard}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Button>

        <Button
          variant="ghost"
          onClick={onBackToDashboard}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          title="Go to Dashboard"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Home</span>
        </Button>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center mb-4"
        >
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-full">
            <Brain className="w-8 h-8 text-white" />
          </div>
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Daily Knowledge</h2>
        <p className="text-gray-600">
          Expand your programming knowledge with today's curated learning content
        </p>
      </div>

      {/* Today's Knowledge Topics */}
      {todayTopics.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Today's Knowledge
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {todayTopics.map((topic, index) => (
              <motion.div
                key={topic._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full transition-all duration-300 hover:shadow-lg border-l-4 border-l-blue-500 hover:border-l-purple-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-lg ${getContentTypeColor(topic.contentType)}`}>
                          {getContentTypeIcon(topic.contentType)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 text-lg">
                            {topic.contentType}
                          </h3>
                          <p className="text-sm text-gray-600">{new Date(topic.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <h4 className="font-medium text-gray-800 mb-4 line-clamp-2">
                      {topic.knowledgeTopic}
                    </h4>
                    <div className="flex items-center justify-center mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>5-10 min read</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => onKnowledgeSelect(topic)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <span>Learn Today</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Past Knowledge Library */}
      {pastTopics.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-green-600" />
            Past Knowledge Library
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastTopics.map((topic, index) => (
              <motion.div
                key={topic._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full transition-all duration-300 hover:shadow-lg border-l-4 border-l-green-500 bg-green-50/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-lg ${getContentTypeColor(topic.contentType)}`}>
                          {getContentTypeIcon(topic.contentType)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 text-lg">
                            {topic.contentType}
                          </h3>
                          <p className="text-sm text-gray-600">{new Date(topic.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <h4 className="font-medium text-gray-800 mb-4 line-clamp-2">
                      {topic.knowledgeTopic}
                    </h4>
                    <div className="flex items-center justify-center mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>5-10 min read</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center text-green-600 mb-2">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">Available</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onKnowledgeSelect(topic)}
                        className="w-full"
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Review Content
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Missed Topics */}
      {missedTopics.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-orange-600" />
            Missed Topics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {missedTopics.map((topic, index) => (
              <motion.div
                key={topic._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full transition-all duration-300 hover:shadow-lg border-l-4 border-l-orange-500 bg-orange-50/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-orange-700 text-lg">
                            {topic.contentType}
                          </h3>
                          <p className="text-sm text-orange-600">{new Date(topic.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Clock className="w-6 h-6 text-orange-500" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <h4 className="font-medium text-gray-800 mb-4 line-clamp-2">
                      {topic.knowledgeTopic}
                    </h4>
                    <div className="flex items-center justify-center mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>5-10 min read</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => onKnowledgeSelect(topic)}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Generate Now
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Future Topics */}
      {futureTopics.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Lock className="w-5 h-5 mr-2 text-gray-500" />
            Coming Soon (Locked)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {futureTopics.map((topic, index) => (
              <motion.div
                key={topic._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full transition-all duration-300 border-l-4 border-l-gray-400 bg-gray-50/50 opacity-60">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 rounded-lg bg-gray-100 text-gray-400">
                          <Lock className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-500 text-lg">
                            {topic.contentType}
                          </h3>
                          <p className="text-sm text-gray-400">{new Date(topic.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Lock className="w-6 h-6 text-gray-400" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <h4 className="font-medium text-gray-500 mb-4 line-clamp-2">
                      {topic.knowledgeTopic}
                    </h4>
                    <div className="flex items-center justify-center mb-4">
                      <div className="flex items-center text-sm text-gray-400">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>5-10 min read</span>
                      </div>
                    </div>
                    <Button
                      disabled
                      className="w-full opacity-50 cursor-not-allowed"
                      variant="outline"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Locked Until {new Date(topic.date).toLocaleDateString()}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8"
      >
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="flex items-center justify-center space-x-3">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-800">
                    {knowledgeTopics.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Topics</div>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-3">
                <Calendar className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-800">
                    {todayTopics.length}
                  </div>
                  <div className="text-sm text-gray-600">Today's Topics</div>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-800">
                    {pastTopics.length}
                  </div>
                  <div className="text-sm text-gray-600">Past Knowledge</div>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-3">
                <Clock className="w-8 h-8 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-800">
                    {missedTopics.length}
                  </div>
                  <div className="text-sm text-gray-600">Missed Topics</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
