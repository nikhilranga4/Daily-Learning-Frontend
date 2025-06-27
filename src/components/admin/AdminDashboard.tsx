import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Users, Code, Calendar, Brain, MessageCircle, Bot } from 'lucide-react';
import { UserManagement } from './UserManagement';
import { LanguageManagement } from './LanguageManagement';
import { TopicManagement } from './TopicManagement';
import { KnowledgeManagement } from './KnowledgeManagement';
import { AdminChatDashboard } from './AdminChatDashboard';
import { LLMManagement } from './LLMManagement';
import { useAuthStore } from '../../store/useAuthStore';

type AdminTab = 'users' | 'languages' | 'topics' | 'knowledge' | 'chat' | 'llm';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const { user } = useAuthStore();

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />;
      case 'languages':
        return <LanguageManagement />;
      case 'topics':
        return <TopicManagement />;
      case 'knowledge':
        return <KnowledgeManagement />;
      case 'chat':
        return user ? (
          <AdminChatDashboard
            currentUser={{
              _id: user._id,
              name: user.name || 'Admin',
              email: user.email,
              isAdmin: true,
              profilePicture: user.profilePicture
            }}
            onBack={() => setActiveTab('users')}
          />
        ) : null;
      case 'llm':
        return user ? (
          <LLMManagement
            currentUser={{
              _id: user._id,
              name: user.name || 'Admin',
              email: user.email,
              isAdmin: true,
            }}
          />
        ) : null;
      default:
        return <p>Coming soon...</p>; // Placeholder
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto"
    >
      <div className="flex items-center mb-8">
        <Settings className="w-8 h-8 text-blue-600 mr-3" />
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Manage users, languages, and daily topics.
          </p>
        </div>
      </div>

      <div className="mb-8 border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <TabButton
            icon={<Users className="w-5 h-5 mr-2" />}
            label="User Management"
            isActive={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
          />
          <TabButton
            icon={<Code className="w-5 h-5 mr-2" />}
            label="Languages"
            isActive={activeTab === 'languages'}
            onClick={() => setActiveTab('languages')}
          />
          <TabButton
            icon={<Calendar className="w-5 h-5 mr-2" />}
            label="Daily Topics"
            isActive={activeTab === 'topics'}
            onClick={() => setActiveTab('topics')}
          />
          <TabButton
            icon={<Brain className="w-5 h-5 mr-2" />}
            label="Daily Knowledge"
            isActive={activeTab === 'knowledge'}
            onClick={() => setActiveTab('knowledge')}
          />
          <TabButton
            icon={<MessageCircle className="w-5 h-5 mr-2" />}
            label="Chat Management"
            isActive={activeTab === 'chat'}
            onClick={() => setActiveTab('chat')}
          />
          <TabButton
            icon={<Bot className="w-5 h-5 mr-2" />}
            label="LLM Models"
            isActive={activeTab === 'llm'}
            onClick={() => setActiveTab('llm')}
          />
        </nav>
      </div>

      <div>{renderContent()}</div>
    </motion.div>
  );
};

// Helper component for tabs
interface TabButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center px-3 py-3 font-medium text-sm rounded-t-lg transition-colors duration-200 ease-in-out ${
      isActive
        ? 'border-b-2 border-blue-600 text-blue-600'
        : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`}
  >
    {icon}
    {label}
  </button>
);