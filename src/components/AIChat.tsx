/**
 * AI 聊天组件
 */
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Trash2, X, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { apiService } from '../services/api';
import { Range } from '../types';
import { calculateProbability, calculateTotalCombinations } from '../utils/probability';
import 'highlight.js/styles/github-dark.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  currentRange?: Range;
}

export const AIChat: React.FC<AIChatProps> = ({ currentRange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [aiEnabled, setAiEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 检查 AI 服务状态
  useEffect(() => {
    checkAIStatus();
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkAIStatus = async () => {
    try {
      const health = await apiService.healthCheck();
      setAiEnabled(health.ai_enabled);
      if (!health.ai_enabled) {
        setMessages([
          {
            role: 'assistant',
            content: '抱歉，AI 服务当前不可用。请联系管理员配置 Azure OpenAI 或 OpenAI API。',
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error('检查 AI 状态失败:', error);
      setAiEnabled(false);
      setMessages([
        {
          role: 'assistant',
          content: '无法连接到后端服务。请确保后端服务已启动（http://localhost:8000）',
          timestamp: new Date(),
        },
      ]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !aiEnabled) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    // 创建一个临时的 AI 消息用于流式更新
    const tempAssistantMessage: Message = {
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, tempAssistantMessage]);

    try {
      // 准备范围上下文
      const rangeContext = currentRange
        ? {
            name: currentRange.name,
            hands: Array.from(currentRange.hands),
            total_combinations: calculateTotalCombinations(currentRange.hands),
            probability: calculateProbability(currentRange.hands),
          }
        : undefined;

      let fullContent = '';
      let receivedConversationId = conversationId;

      // 使用流式 API
      for await (const chunk of apiService.chatStream({
        message: currentInput,
        conversation_id: conversationId || undefined,
        range_context: rangeContext,
      })) {
        if (chunk.type === 'conversation_id') {
          receivedConversationId = chunk.conversation_id || conversationId;
          if (!conversationId) {
            setConversationId(receivedConversationId);
          }
        } else if (chunk.type === 'content') {
          fullContent += chunk.content || '';
          // 更新最后一条消息的内容
          setMessages((prev) => {
            const newMessages = [...prev];
            if (newMessages.length > 0) {
              newMessages[newMessages.length - 1] = {
                ...newMessages[newMessages.length - 1],
                content: fullContent,
              };
            }
            return newMessages;
          });
        } else if (chunk.type === 'error') {
          throw new Error(chunk.error || '未知错误');
        }
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      // 更新最后一条消息为错误消息
      setMessages((prev) => {
        const newMessages = [...prev];
        if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'assistant') {
          newMessages[newMessages.length - 1] = {
            ...newMessages[newMessages.length - 1],
            content: `抱歉，发送消息失败：${error instanceof Error ? error.message : '未知错误'}`,
          };
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (conversationId) {
      try {
        await apiService.clearConversation(conversationId);
      } catch (error) {
        console.error('清除对话失败:', error);
      }
    }
    setMessages([]);
    setConversationId(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* 浮动按钮 */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all z-50 group"
          aria-label="打开 AI 助手"
        >
          <MessageCircle size={24} />
          <span className="absolute bottom-full right-0 mb-2 px-3 py-1 text-sm bg-gray-900 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            AI 助手
          </span>
        </button>
      )}

      {/* 聊天窗口 */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* 头部 */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bot size={24} />
              <div>
                <h3 className="font-semibold">德州扑克 AI 助手</h3>
                <p className="text-xs opacity-90">
                  {aiEnabled ? '在线' : '离线'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleClearChat}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                aria-label="清除对话"
                title="清除对话"
              >
                <Trash2 size={18} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                aria-label="关闭"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && aiEnabled && (
              <div className="text-center text-gray-500 mt-8">
                <Bot size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-sm">你好！我是德州扑克 AI 助手</p>
                <p className="text-xs mt-2">
                  我可以帮你分析手牌范围、解答策略问题
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                {/* 头像 */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User size={18} />
                  ) : (
                    <Bot size={18} />
                  )}
                </div>

                {/* 消息内容 */}
                <div
                  className={`flex-1 ${
                    message.role === 'user' ? 'text-right' : ''
                  }`}
                >
                  <div
                    className={`inline-block p-3 rounded-lg max-w-full ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                    ) : (
                      <div className="text-sm prose prose-sm max-w-none prose-pre:bg-gray-800 prose-pre:text-gray-100">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeHighlight]}
                          components={{
                            // 自定义代码块样式
                            code: ({ node, inline, className, children, ...props }: any) => {
                              return inline ? (
                                <code className="bg-gray-200 text-red-600 px-1 py-0.5 rounded text-xs" {...props}>
                                  {children}
                                </code>
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            },
                            // 自定义链接样式
                            a: ({ node, children, ...props }: any) => (
                              <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props}>
                                {children}
                              </a>
                            ),
                            // 自定义表格样式
                            table: ({ node, children, ...props }: any) => (
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-300" {...props}>
                                  {children}
                                </table>
                              </div>
                            ),
                          }}
                        >
                          {message.content || '正在思考...'}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {message.timestamp.toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* 加载中动画（仅在没有消息时显示） */}
            {isLoading && messages.length === 0 && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <Bot size={18} className="text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="inline-block p-3 rounded-lg bg-gray-100">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 输入框 */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  aiEnabled ? '输入消息...' : 'AI 服务不可用'
                }
                disabled={!aiEnabled || isLoading}
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || !aiEnabled || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                aria-label="发送"
              >
                <Send size={20} />
              </button>
            </div>
            {currentRange && (
              <p className="text-xs text-gray-500 mt-2">
                当前范围: {currentRange.name}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

