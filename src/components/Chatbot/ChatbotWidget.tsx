import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { MessageSquare, Send, X, Loader2 } from 'lucide-react';
import './ChatbotWidget.css';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { theme } = useTheme();

  const [serverAvailable, setServerAvailable] = useState<boolean | null>(null);

  // Check server health and load messages on component mount
  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/health', {
          method: 'GET',
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        
        if (response.ok) {
          setServerAvailable(true);
          
          // Load saved messages after confirming server is available
          const savedMessages = sessionStorage.getItem('chatMessages');
          if (savedMessages) {
            try {
              setMessages(JSON.parse(savedMessages));
            } catch (error) {
              console.error('Error parsing saved messages:', error);
              // Add welcome message if parsing fails
              addWelcomeMessage();
            }
          } else {
            // Add welcome message if no saved messages
            addWelcomeMessage();
          }
        } else {
          setServerAvailable(false);
          addServerUnavailableMessage();
        }
      } catch (error) {
        console.error('Error checking server health:', error);
        setServerAvailable(false);
        addServerUnavailableMessage();
      }
    };
    
    const addWelcomeMessage = () => {
      const welcomeMessage: Message = {
        role: 'assistant',
        content: 'Hello! I\'m LearnFlow Assistant. How can I help you with your educational needs today?',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    };
    
    const addServerUnavailableMessage = () => {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'The AI service is currently unavailable. Please try again later.',
        timestamp: new Date()
      };
      setMessages([errorMessage]);
    };
    
    checkServerHealth();
  }, []);

  // Save messages to session storage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat is opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (input.trim() === '' || isLoading || serverAvailable === false) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    // Update UI immediately with user message
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Maximum number of retries
    const maxRetries = 2;
    let retries = 0;
    let success = false;

    while (retries <= maxRetries && !success) {
      try {
        // Get all previous messages for context (limit to last 10 for performance)
        const recentMessages = [...messages.slice(-10), userMessage].map(({ role, content }) => ({
          role,
          content
        }));

        // Call backend API
        const response = await fetch('http://localhost:3001/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages: recentMessages }),
          // Add timeout to prevent hanging requests
          signal: AbortSignal.timeout(15000) // 15 second timeout
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Server error: ${response.status} ${errorData.error || ''}`);
        }

        const data = await response.json();
        
        if (!data.message || !data.message.content) {
          throw new Error('Invalid response format from server');
        }
        
        // Add assistant response to chat
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.message.content,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
        success = true;
      } catch (error) {
        console.error(`Error sending message (attempt ${retries + 1}/${maxRetries + 1}):`, error);
        retries++;
        
        // Only show error message if all retries failed
        if (retries > maxRetries) {
          // Add error message
          const errorMessage: Message = {
            role: 'assistant',
            content: 'Sorry, I encountered an error connecting to the AI service. Please check your connection and try again later.',
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, errorMessage]);
        } else {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
      }
    }
    
    setIsLoading(false);
  };

  const formatTimestamp = (date?: Date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`chatbot-container ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      {/* Chat toggle button */}
      <button 
        className="chat-toggle-btn"
        onClick={toggleChat}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>LearnFlow Assistant</h3>
            <button 
              className="close-btn"
              onClick={toggleChat}
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>
          
          <div className="messages-container">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
              >
                <div className="message-content">{message.content}</div>
                <div className="message-timestamp">{formatTimestamp(message.timestamp)}</div>
              </div>
            ))}
            {isLoading && (
              <div className="message assistant-message">
                <div className="message-content loading">
                  <Loader2 className="animate-spin" size={18} />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chat-input-container">
            <textarea
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              disabled={isLoading}
            />
            <button 
              className="send-btn"
              onClick={handleSendMessage}
              disabled={input.trim() === '' || isLoading}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;