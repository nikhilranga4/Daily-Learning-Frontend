import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Copy, Check } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { LLMMessage } from '../../lib/llmApi';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface LLMMessageComponentProps {
  message: LLMMessage;
  isUser: boolean;
  currentUser: {
    _id: string;
    name: string;
    email: string;
  };
}

export const LLMMessageComponent: React.FC<LLMMessageComponentProps> = ({
  message,
  isUser,
  currentUser,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (text: string, codeId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(codeId);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const CodeBlock = ({ language, value, ...props }: any) => {
    const codeId = `code-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className="relative group">
        <div className="flex items-center justify-between bg-gray-800 text-gray-300 px-4 py-2 text-sm rounded-t-lg">
          <span className="font-medium">{language || 'code'}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(value, codeId)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-white p-1 h-auto"
          >
            {copiedCode === codeId ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
        <SyntaxHighlighter
          style={oneDark}
          language={language}
          PreTag="div"
          className="!mt-0 !rounded-t-none"
          {...props}
        >
          {String(value).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    );
  };

  const InlineCode = ({ children, ...props }: any) => (
    <code
      className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono"
      {...props}
    >
      {children}
    </code>
  );

  const MarkdownComponents = {
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      return !inline ? (
        <CodeBlock language={language} value={String(children)} {...props} />
      ) : (
        <InlineCode {...props}>{children}</InlineCode>
      );
    },
    
    // Custom styling for other markdown elements
    h1: ({ children }: any) => (
      <h1 className="text-2xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
        {children}
      </h1>
    ),
    
    h2: ({ children }: any) => (
      <h2 className="text-xl font-semibold text-gray-800 mb-3 mt-6">
        {children}
      </h2>
    ),
    
    h3: ({ children }: any) => (
      <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">
        {children}
      </h3>
    ),
    
    p: ({ children }: any) => (
      <p className="text-gray-700 mb-4 leading-relaxed">
        {children}
      </p>
    ),
    
    ul: ({ children }: any) => (
      <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
        {children}
      </ul>
    ),
    
    ol: ({ children }: any) => (
      <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-1">
        {children}
      </ol>
    ),
    
    li: ({ children }: any) => (
      <li className="text-gray-700">
        {children}
      </li>
    ),
    
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-4 bg-blue-50 text-gray-700 italic">
        {children}
      </blockquote>
    ),
    
    table: ({ children }: any) => (
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full border border-gray-300 rounded-lg">
          {children}
        </table>
      </div>
    ),
    
    thead: ({ children }: any) => (
      <thead className="bg-gray-50">
        {children}
      </thead>
    ),
    
    th: ({ children }: any) => (
      <th className="px-4 py-2 text-left font-medium text-gray-800 border-b border-gray-300">
        {children}
      </th>
    ),
    
    td: ({ children }: any) => (
      <td className="px-4 py-2 text-gray-700 border-b border-gray-200">
        {children}
      </td>
    ),
    
    a: ({ children, href }: any) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline"
      >
        {children}
      </a>
    ),
    
    strong: ({ children }: any) => (
      <strong className="font-semibold text-gray-800">
        {children}
      </strong>
    ),
    
    em: ({ children }: any) => (
      <em className="italic text-gray-700">
        {children}
      </em>
    ),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start space-x-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className={`flex-1 max-w-3xl ${isUser ? 'flex justify-end' : ''}`}>
        <Card className={`${isUser ? 'bg-gray-100 border-gray-200' : 'bg-white'} shadow-sm`}>
          <CardContent className="p-4">
            {isUser ? (
              <div>
                <p className="text-black leading-relaxed whitespace-pre-wrap font-medium">
                  {message.content}
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-300">
                  <span className="text-xs text-gray-600 font-medium">
                    {currentUser.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown components={MarkdownComponents}>
                    {message.content}
                  </ReactMarkdown>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    AI Assistant
                  </span>
                  <div className="flex items-center space-x-2">
                    {message.tokens && (
                      <span className="text-xs text-gray-400">
                        {message.tokens} tokens
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {isUser && (
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </motion.div>
  );
};
