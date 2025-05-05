import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { MessageSquare, Send, X, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import './ChatbotWidget.css';

// Google Gemini API key - This is only for reference, actual API calls go through the backend
// const GEMINI_API_KEY = 'AIzaSyCOj3Extd63rPuOIHmhbSZNz2lqJwamAwk';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  isCommand?: boolean;
}

// List of available commands
const COMMANDS = [
  { 
    command: '/scan', 
    description: 'Scan project files for issues', 
    usage: '/scan [directory]',
    example: '/scan src/components'
  },
  { 
    command: '/debug', 
    description: 'Debug code issues in project files', 
    usage: '/debug [directory]',
    example: '/debug server'
  },
  { 
    command: '/clear', 
    description: 'Clear chat history', 
    usage: '/clear',
    example: '/clear'
  },
  { 
    command: '/help', 
    description: 'Show available commands', 
    usage: '/help',
    example: '/help'
  }
];

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { theme } = useTheme();

  const [serverAvailable, setServerAvailable] = useState<boolean | null>(null);

  // Load messages and initialize chatbot on component mount
  useEffect(() => {
    const initializeChatbot = async () => {
      // Always set server as available to ensure input works
      setServerAvailable(true);
      
      // Load saved messages if available
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
      
      // Try to check server health in the background
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('http://localhost:3001/api/health', {
          method: 'GET',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          console.warn('Server health check returned non-OK status');
          // Don't disable the chat - we'll handle errors during message sending
        }
      } catch (error) {
        console.warn('Server health check failed, but continuing anyway:', error);
        // Don't disable the chat - we'll handle errors during message sending
      }
    };
    
    const addWelcomeMessage = () => {
      const welcomeMessage: Message = {
        role: 'assistant',
        content: 'Hello! I\'m LearnFlow Assistant powered by Google Gemini. How can I help you with your educational needs today?',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    };
    
    initializeChatbot();
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
  
  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
    // Scroll to bottom when maximizing/minimizing
    setTimeout(() => {
      scrollToBottom();
    }, 100);
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

  // Handle client-side commands
  const handleClientCommand = (command: string): boolean => {
    const commandParts = command.split(' ');
    const commandName = commandParts[0].toLowerCase();
    
    switch (commandName) {
      case '/help':
        // Display available commands
        const helpMessage: Message = {
          role: 'assistant',
          content: `Available commands:\n\n${COMMANDS.map(cmd => 
            `**${cmd.command}** - ${cmd.description}\nUsage: ${cmd.usage}\nExample: ${cmd.example}`
          ).join('\n\n')}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, helpMessage]);
        return true;
        
      case '/clear':
        // Clear chat history
        const clearMessage: Message = {
          role: 'assistant',
          content: 'Chat history cleared.',
          timestamp: new Date()
        };
        setMessages([clearMessage]);
        sessionStorage.removeItem('chatMessages');
        return true;
        
      default:
        return false; // Not a client-side command
    }
  };

  const handleSendMessage = async () => {
    // Only check if input is empty or if we're already loading
    if (input.trim() === '' || isLoading) return;

    const trimmedInput = input.trim();
    const isCommand = trimmedInput.startsWith('/');
    
    // Special handling for /reset command
    if (trimmedInput.toLowerCase() === '/reset') {
      // Clear chat history
      const clearMessage: Message = {
        role: 'assistant',
        content: 'Chat history has been reset.',
        timestamp: new Date()
      };
      setMessages([clearMessage]);
      sessionStorage.removeItem('chatMessages');
      setInput('');
      return;
    }
    
    const userMessage: Message = {
      role: 'user',
      content: trimmedInput,
      timestamp: new Date(),
      isCommand
    };

    // Update UI immediately with user message
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Handle client-side commands
    if (isCommand && handleClientCommand(trimmedInput)) {
      return; // Command was handled client-side
    }
    
    setIsLoading(true);

    // Maximum number of retries
    const maxRetries = 3; // Increase retries
    let retries = 0;
    let success = false;

    // Define API endpoints to try
    const apiEndpoints = [
      'https://learnflow.vercel.app/api/chat', // Vercel deployment (replace with your actual Vercel URL)
      '/api/chat',                             // Same-origin relative path
      `${window.location.origin}/api/chat`,    // Absolute path using current origin
      'http://localhost:3001/api/chat'         // Local development (fallback)
    ];

    while (retries <= maxRetries && !success) {
      // Try each endpoint in order
      const endpointIndex = Math.min(retries, apiEndpoints.length - 1);
      const currentEndpoint = apiEndpoints[endpointIndex];
      
      try {
        console.log(`Attempt ${retries + 1}/${maxRetries + 1} using endpoint: ${currentEndpoint}`);
        
        // Get all previous messages for context (last 5 messages for context)
        const contextMessages = isCommand 
          ? [userMessage] 
          : [...messages.slice(-5), userMessage];
        
        const recentMessages = contextMessages.map(({ role, content }) => ({
          role,
          content
        }));

        // Add system message
        const systemMessage = {
          role: 'system',
          content: `You are a helpful educational assistant for LearnFlow platform powered by Google Gemini.
          
You can answer questions about:
1. Educational topics and concepts
2. Programming and coding help
3. Study techniques and learning strategies
4. LearnFlow website navigation and features
5. Course materials and resources
6. Current events and general knowledge

Always provide helpful, accurate, and educational responses.`
        };

        // Prepare the payload for Gemini API
        const payload = {
          messages: [systemMessage, ...recentMessages],
          userId: 'user-' + Date.now() // Simple user identifier
        };

        // Call backend API
        const response = await fetch(currentEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          // Add timeout to prevent hanging requests
          signal: AbortSignal.timeout(15000) // 15 second timeout
        });

        if (!response.ok) {
          // Check for rate limiting
          if (response.status === 429) {
            const errorData = await response.json();
            const waitTime = Math.ceil((errorData.resetTime - Date.now()) / 1000);
            throw new Error(`Rate limit exceeded. Please try again in ${waitTime} seconds.`);
          }
          
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
          // Generate a fallback response on the client side if server is unreachable
          let fallbackResponse = 'Sorry, I couldn\'t connect to the server right now. Try again later.';
          
          // Simple fallback responses based on user input
          if (trimmedInput.toLowerCase().includes('hello') || trimmedInput.toLowerCase().includes('hi')) {
            fallbackResponse = "Hello! I'm LearnFlow Assistant powered by Google Gemini. I'm having trouble connecting to my knowledge base right now, but I'll try to help as best I can.";
          } else if (trimmedInput.toLowerCase().includes('help')) {
            fallbackResponse = "I'd like to help, but I'm having connection issues with the Gemini API. Please try again later or check the Resources section for immediate assistance.";
          }
          
          const errorMessage: Message = {
            role: 'assistant',
            content: fallbackResponse,
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

  // State for command suggestions
  const [showCommandSuggestions, setShowCommandSuggestions] = useState(false);
  const [commandSuggestions, setCommandSuggestions] = useState<typeof COMMANDS>([]);
  
  // Handle input changes and show command suggestions
  useEffect(() => {
    if (input.startsWith('/')) {
      const inputCommand = input.split(' ')[0].toLowerCase();
      const suggestions = COMMANDS.filter(cmd => 
        cmd.command.toLowerCase().includes(inputCommand)
      );
      setCommandSuggestions(suggestions);
      setShowCommandSuggestions(suggestions.length > 0);
    } else {
      setShowCommandSuggestions(false);
    }
  }, [input]);
  
  // Handle command selection
  const selectCommand = (command: string) => {
    setInput(command + ' ');
    setShowCommandSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Format message content with markdown-like syntax
  const formatMessageContent = (content: string) => {
    // Replace markdown-style bold with HTML
    const boldText = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Replace markdown-style code blocks with HTML
    const codeBlocks = boldText.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // Replace markdown-style inline code with HTML
    const inlineCode = codeBlocks.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Replace URLs with clickable links
    const withLinks = inlineCode.replace(
      /(https?:\/\/[^\s]+)/g, 
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    
    // Replace newlines with <br>
    return withLinks.replace(/\n/g, '<br>');
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

      {/* Overlay for maximized chat */}
      {isOpen && isMaximized && <div className="chat-overlay" onClick={toggleMaximize}></div>}

      {/* Chat window */}
      {isOpen && (
        <div className={`chat-window ${isMaximized ? 'maximized' : ''}`}>
          <div className="chat-header">
            <h3>LearnFlow Assistant</h3>
            <div className="header-actions">
              <button 
                className="help-btn"
                onClick={() => handleClientCommand('/help')}
                aria-label="Help"
                title="Show available commands"
              >
                ?
              </button>
              <button 
                className="maximize-btn"
                onClick={toggleMaximize}
                aria-label={isMaximized ? "Minimize chat" : "Maximize chat"}
                title={isMaximized ? "Minimize chat" : "Maximize chat"}
              >
                {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              <button 
                className="close-btn"
                onClick={toggleChat}
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          
          <div className="messages-container">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'} ${message.isCommand ? 'command-message' : ''}`}
              >
                <div 
                  className="message-content"
                  dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
                />
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
            {showCommandSuggestions && (
              <div className="command-suggestions">
                {commandSuggestions.map((cmd, index) => (
                  <div 
                    key={index} 
                    className="command-suggestion"
                    onClick={() => selectCommand(cmd.command)}
                  >
                    <span className="command-name">{cmd.command}</span>
                    <span className="command-description">{cmd.description}</span>
                  </div>
                ))}
              </div>
            )}
            <textarea
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message or / for commands..."
              rows={1}
              disabled={isLoading} // Only disable when loading
            />
            <button 
              className="send-btn"
              onClick={handleSendMessage}
              disabled={input.trim() === '' || isLoading} // Only disable when empty or loading
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
          
          {/* Educational suggestions */}
          <div className="suggestion-chips">
            <button 
              className="suggestion-chip"
              onClick={() => setInput("Explain the concept of nanomaterials in CHB 101.")}
              disabled={isLoading}
            >
              Nanomaterials in CHB 101
            </button>
            <button 
              className="suggestion-chip"
              onClick={() => setInput("Give me Python code for a bubble sort algorithm.")}
              disabled={isLoading}
            >
              Bubble sort in Python
            </button>
            <button 
              className="suggestion-chip"
              onClick={() => setInput("What are the latest advancements in quantum computing?")}
              disabled={isLoading}
            >
              Quantum computing news
            </button>
            <button 
              className="suggestion-chip"
              onClick={() => setInput("How do I find the course materials for CSE 2nd semester?")}
              disabled={isLoading}
            >
              Find CSE materials
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;