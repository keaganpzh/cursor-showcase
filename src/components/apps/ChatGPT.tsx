import { useState, useRef, useEffect } from 'react';
import { AiOutlineSend, AiOutlineRobot, AiOutlineUser } from 'react-icons/ai';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const OPENAI_API_KEY = (import.meta.env as { VITE_OPENAI_API_KEY?: string }).VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export default function ChatGPT() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m ChatGPT. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!OPENAI_API_KEY) {
      setError('OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your environment variables.');
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !OPENAI_API_KEY) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            ...messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            {
              role: 'user',
              content: userMessage.content,
            },
          ],
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API error: ${response.statusText}`);
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.choices[0]?.message?.content || 'No response received.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get response from ChatGPT';
      setError(errorMessage);
      console.error('ChatGPT API error:', err);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Hello! I\'m ChatGPT. How can I help you today?',
        timestamp: new Date(),
      },
    ]);
    setError(null);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div
        className="border-b p-3 flex items-center justify-between flex-shrink-0"
        style={{
          background: 'linear-gradient(to bottom, #ffffff 0%, #f8f8f8 100%)',
          borderBottom: '0.5px solid rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="flex items-center gap-2">
          <AiOutlineRobot className="text-xl" style={{ color: '#007aff' }} />
          <h2 className="text-sm font-semibold" style={{ color: '#1d1d1f' }}>
            ChatGPT
          </h2>
        </div>
        <button
          onClick={handleClearChat}
          className="px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150"
          style={{
            background: 'white',
            color: '#666',
            border: '0.5px solid rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f5f5f7';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
          }}
        >
          Clear Chat
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          className="border-b p-3 text-sm flex items-center justify-between flex-shrink-0"
          style={{
            background: 'rgba(255, 59, 48, 0.1)',
            borderBottom: '0.5px solid rgba(255, 59, 48, 0.2)',
            color: '#d70015',
          }}
        >
          <span className="font-medium">{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 transition-colors px-2"
            style={{ color: '#ff3b30' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: '#f5f5f7' }}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: '#007aff' }}
              >
                <AiOutlineRobot className="text-white text-sm" />
              </div>
            )}
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2.5 ${
                message.role === 'user'
                  ? 'rounded-tr-sm'
                  : 'rounded-tl-sm'
              }`}
              style={{
                background: message.role === 'user' ? '#007aff' : 'white',
                color: message.role === 'user' ? 'white' : '#1d1d1f',
                border: message.role === 'assistant' ? '0.5px solid rgba(0, 0, 0, 0.1)' : 'none',
                boxShadow:
                  message.role === 'assistant'
                    ? '0 1px 2px rgba(0, 0, 0, 0.05)'
                    : '0 1px 2px rgba(0, 122, 255, 0.2)',
              }}
            >
              <div className="text-sm whitespace-pre-wrap break-words">{message.content}</div>
              <div
                className="text-xs mt-1.5 opacity-70"
                style={{ color: message.role === 'user' ? 'rgba(255, 255, 255, 0.8)' : '#666' }}
              >
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            {message.role === 'user' && (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: '#007aff' }}
              >
                <AiOutlineUser className="text-white text-sm" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: '#007aff' }}
            >
              <AiOutlineRobot className="text-white text-sm" />
            </div>
            <div
              className="rounded-lg rounded-tl-sm px-4 py-2.5"
              style={{
                background: 'white',
                border: '0.5px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div className="flex gap-1">
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: '#007aff', animationDelay: '0ms' }}
                />
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: '#007aff', animationDelay: '150ms' }}
                />
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: '#007aff', animationDelay: '300ms' }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        className="border-t p-3 flex-shrink-0"
        style={{
          background: 'white',
          borderTop: '0.5px solid rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={OPENAI_API_KEY ? "Type a message..." : "API key not configured"}
            disabled={isLoading || !OPENAI_API_KEY}
            className="flex-1 resize-none outline-none text-sm px-4 py-2.5 rounded-lg"
            style={{
              background: '#f5f5f7',
              border: '0.5px solid rgba(0, 0, 0, 0.1)',
              color: '#1d1d1f',
              minHeight: '44px',
              maxHeight: '120px',
            }}
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || !OPENAI_API_KEY}
            className="px-4 py-2.5 rounded-lg transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
            style={{
              background: '#007aff',
              color: 'white',
              border: '0.5px solid rgba(0, 0, 0, 0.1)',
              minWidth: '44px',
              minHeight: '44px',
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.background = '#0051d5';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.background = '#007aff';
              }
            }}
          >
            <AiOutlineSend className="text-lg" />
          </button>
        </div>
        <div className="text-xs mt-2 text-center" style={{ color: '#666' }}>
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}

