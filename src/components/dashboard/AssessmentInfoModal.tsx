import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Calendar, 
  Clock, 
  BookOpen,
  Target,
  Timer,
  Play,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { DailyTopic } from '../../types';

interface AssessmentInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyTopic: DailyTopic;
  onStartAssessment: () => void;
}

export const AssessmentInfoModal: React.FC<AssessmentInfoModalProps> = ({
  isOpen,
  onClose,
  dailyTopic,
  onStartAssessment
}) => {
  if (!isOpen) return null;

  const getStatusInfo = () => {
    if (dailyTopic.completed) {
      return {
        icon: <CheckCircle className="w-6 h-6 text-green-600" />,
        title: 'Assessment Completed',
        description: `You scored ${dailyTopic.score}/${dailyTopic.totalQuestions}`,
        buttonText: 'View Results',
        buttonColor: 'bg-green-600 hover:bg-green-700'
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const assessmentDate = dailyTopic.date;
    
    if (assessmentDate > today) {
      return {
        icon: <AlertCircle className="w-6 h-6 text-gray-500" />,
        title: 'Assessment Locked',
        description: 'This assessment will be available on the scheduled date',
        buttonText: 'Not Available',
        buttonColor: 'bg-gray-400 cursor-not-allowed',
        disabled: true
      };
    }

    return {
      icon: <Play className="w-6 h-6 text-blue-600" />,
      title: assessmentDate === today ? 'Start Today\'s Assessment' : 'Pending Assessment',
      description: assessmentDate === today ? 'Ready to begin' : 'Complete this pending assessment',
      buttonText: 'Start Assessment',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    };
  };

  const statusInfo = getStatusInfo();

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
          className="bg-white rounded-lg shadow-xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                {statusInfo.icon}
                <div>
                  <h2 className="text-xl font-bold">{statusInfo.title}</h2>
                  <p className="text-blue-100 text-sm">{statusInfo.description}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={onClose}
                className="text-white border-white hover:bg-white hover:text-blue-600 p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-4">
              {/* Assessment Details */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-800">Assessment Details</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-800">{dailyTopic.languageName}</p>
                      <p className="text-sm text-gray-600">Programming Language</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Target className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-800">{dailyTopic.topic}</p>
                      <p className="text-sm text-gray-600">Topic</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-800">
                        {new Date(dailyTopic.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-600">Scheduled Date</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Timer className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-gray-800">30 minutes</p>
                      <p className="text-sm text-gray-600">Time Limit</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-medium text-gray-800">15-25 Questions</p>
                      <p className="text-sm text-gray-600">Multiple Choice</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Instructions */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Instructions:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• You have only one attempt per assessment</li>
                    <li>• Complete all questions within the time limit</li>
                    <li>• You can navigate between questions</li>
                    <li>• Submit before time runs out</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={statusInfo.disabled ? undefined : onStartAssessment}
                disabled={statusInfo.disabled}
                className={`flex-1 ${statusInfo.buttonColor}`}
              >
                {statusInfo.buttonText}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
