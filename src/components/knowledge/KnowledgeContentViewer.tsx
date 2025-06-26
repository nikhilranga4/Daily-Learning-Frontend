import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Brain,
  Clock,
  Star,
  BookOpen,
  Lightbulb,
  Target,
  Calendar,
  User,
  CheckCircle,
  Loader
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { knowledgeApi } from '../../lib/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface KnowledgeTopic {
  _id: string;
  knowledgeTopic: string;
  contentType: 'Concept' | 'Tutorial' | 'Best Practice' | 'Tips & Tricks' | 'Deep Dive';
  isGenerated: boolean;
  isViewed: boolean;
  generatedAt?: string;
}

interface KnowledgeContent {
  _id: string;
  knowledgeTopic: string;
  contentType: string;
  content: string;
  generatedAt: string;
  viewedAt: string;
}

interface KnowledgeContentViewerProps {
  topic: KnowledgeTopic;
  onBack: () => void;
}

export const KnowledgeContentViewer: React.FC<KnowledgeContentViewerProps> = ({
  topic,
  onBack
}) => {
  const [content, setContent] = useState<KnowledgeContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (topic.isViewed) {
      fetchExistingContent();
    }
  }, [topic]);

  const fetchExistingContent = async () => {
    try {
      setLoading(true);
      const response = await knowledgeApi.getKnowledgeContent(topic._id);
      setContent(response.data.data);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const generateContent = async () => {
    try {
      setGenerating(true);
      toast.loading('Generating your personalized knowledge content...', { duration: 3000 });

      const response = await knowledgeApi.generateKnowledge(topic._id);
      setContent(response.data.data);

      toast.dismiss();
      toast.success('Knowledge content generated successfully!');
    } catch (error: any) {
      console.error('Error generating content:', error);
      toast.dismiss();

      if (error.response?.status === 400) {
        toast.error('You have already viewed this topic today');
      } else {
        toast.error('Failed to generate content');
      }
    } finally {
      setGenerating(false);
    }
  };



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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Knowledge</span>
        </Button>
      </div>

      {/* Topic Header */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${getContentTypeColor(topic.contentType)}`}>
                {getContentTypeIcon(topic.contentType)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">
                  {topic.knowledgeTopic}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-1" />
                    <span>{topic.contentType}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    <span>Daily Knowledge</span>
                  </div>
                </div>
              </div>
            </div>
            {topic.isViewed && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-6 h-6 mr-2" />
                <span className="text-sm font-medium">Completed</span>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Content Area */}
      {!content && !loading && !generating && (
        <Card className="text-center py-12">
          <CardContent>
            <Brain className="w-16 h-16 mx-auto text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Ready to Learn?
            </h3>
            <p className="text-gray-600 mb-6">
              Generate personalized knowledge content about {topic.knowledgeTopic}
            </p>
            <Button
              onClick={generateContent}
              disabled={generating}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {generating ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Generating Content...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate Knowledge
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {(loading || generating) && (
        <Card className="text-center py-12">
          <CardContent>
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 mt-4">
              {generating ? 'Generating your personalized content...' : 'Loading content...'}
            </p>
          </CardContent>
        </Card>
      )}

      {content && (
        <Card>
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Clock className="w-5 h-5 text-gray-500" />
                <div className="text-sm text-gray-600">
                  <span>Generated: {new Date(content.generatedAt).toLocaleDateString()}</span>
                  {content.viewedAt && (
                    <span className="ml-4">
                      Viewed: {new Date(content.viewedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                <span>5-10 min read</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={tomorrow}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {content.content}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};
