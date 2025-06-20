import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { MessageSquare, Send, X, Maximize2, Minimize2 } from 'lucide-react';
import LoadingAnimation from '../LoadingAnimation';
import './ChatbotWidget.css';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  isCommand?: boolean;
}

// List of available commands
const COMMANDS = [
  // {
  //   command: '/scan',
  //   description: 'Scan project files for issues',
  //   usage: '/scan [directory]',
  //   example: '/scan src/components'
  // },
  // {
  //   command: '/debug',
  //   description: 'Debug code issues in project files',
  //   usage: '/debug [directory]',
  //   example: '/debug server'
  // },
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
  const [showNotification, setShowNotification] = useState(false);
  const [isNotificationLeaving, setIsNotificationLeaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const notificationTimerRef = useRef<NodeJS.Timeout | null>(null);
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

  // Clean up body style and timers when component unmounts
  useEffect(() => {
    return () => {
      restoreBodyStyles();
      // Clear any timers to prevent memory leaks
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
    };
  }, []);

  // Safety effect to ensure body styles are properly managed when chat state changes
  useEffect(() => {
    if (!isOpen && !isMaximized) {
      // Only restore body styles on mobile devices or when maximized chat was closed
      // On desktop, don't interfere with normal page scrolling when just opening/closing chat
      if (isMobileDevice()) {
        restoreBodyStyles();
      }
    }
  }, [isOpen, isMaximized]);

  // Notification timer effect
  useEffect(() => {
    let notificationInterval: NodeJS.Timeout | null = null;
    let hideTimeout: NodeJS.Timeout | null = null;

    const showAndHideNotification = () => {
      // Only show notification if chat is closed
      if (!isOpen) {
        // Reset leaving state and show notification
        setIsNotificationLeaving(false);
        setShowNotification(true);

        // Hide notification after 5 seconds (full display time)
        if (hideTimeout) clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => {
          // Start slide down animation
          setIsNotificationLeaving(true);

          // Actually hide the notification after animation completes
          setTimeout(() => {
            setShowNotification(false);
            setIsNotificationLeaving(false);
          }, 800); // Match the slide down animation duration
        }, 5000);
      }
    };

    // Start interval when chat is closed
    if (!isOpen) {
      // Show notification immediately on close
      showAndHideNotification();

      // Set interval to show notification every 20 seconds
      // (5 seconds display + 15 seconds pause between notifications)
      notificationInterval = setInterval(showAndHideNotification, 20000);
    } else {
      // If chat is open, hide notification with slide down animation
      if (showNotification) {
        setIsNotificationLeaving(true);
        setTimeout(() => {
          setShowNotification(false);
          setIsNotificationLeaving(false);
        }, 800);
      }
    }

    // Cleanup function
    return () => {
      if (notificationInterval) clearInterval(notificationInterval);
      if (hideTimeout) clearTimeout(hideTimeout);
    };
  }, [isOpen]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      try {
        // Find the messages container specifically
        const container = messagesEndRef.current.closest('.messages-container');
        if (container) {
          // Use scrollTop to scroll within the container only
          container.scrollTop = container.scrollHeight;
        }
      } catch (error) {
        console.error('Error scrolling to bottom:', error);
      }
    }
  };

  // Helper function to focus on the input field
  const focusInputField = (delay = 100) => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, delay);
  };

  // Helper function to check if device is mobile
  const isMobileDevice = () => {
    return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Helper function to restore body styles
  const restoreBodyStyles = () => {
    document.body.classList.remove('chat-open');
    document.body.classList.remove('chat-maximized');
    // Only restore styles if they were set by the chatbot
    if (document.body.style.overflow === 'hidden' || document.body.style.position === 'fixed') {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.top = '';
    }
  };

  const toggleChat = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    // If opening the chat, focus on the input field and prevent background scrolling
    if (newIsOpen) {
      focusInputField(300); // Slightly longer delay to allow animation to complete
      
      // Only prevent background scrolling on mobile devices
      if (isMobileDevice()) {
        // Store current scroll position to restore later
        const scrollY = window.scrollY;
        document.body.classList.add('chat-open');
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        document.body.style.top = `-${scrollY}px`;
      } else {
        // On desktop, just add the class for CSS targeting but don't modify styles
        document.body.classList.add('chat-open');
      }
    } else {
      // If closing the chat, restore body overflow and position
      // Also reset maximized state to ensure proper cleanup
      setIsMaximized(false);
      
      if (isMobileDevice()) {
        // Restore scroll position on mobile
        const scrollY = document.body.style.top;
        const scrollPosition = scrollY ? parseInt(scrollY.replace('px', '')) * -1 : 0;
        restoreBodyStyles();
        if (scrollPosition > 0) {
          window.scrollTo(0, scrollPosition);
        }
      } else {
        // On desktop, just remove the CSS class but don't modify body styles
        document.body.classList.remove('chat-open');
      }
    }
  };

  const toggleMaximize = () => {
    const newMaximizedState = !isMaximized;
    setIsMaximized(newMaximizedState);

    if (newMaximizedState) {
      // Add maximized class for CSS targeting
      document.body.classList.add('chat-maximized');
      
      // Only apply body style changes on mobile devices or when necessary
      // On desktop, let CSS handle the maximized state without interfering with body scroll
      if (isMobileDevice()) {
        // Store current scroll position when maximizing on mobile
        const scrollY = window.scrollY;
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        document.body.style.top = `-${scrollY}px`;
      }
    } else {
      // Remove maximized class
      document.body.classList.remove('chat-maximized');
      
      // Only restore body styles if they were modified (mobile devices)
      if (isMobileDevice()) {
        // When minimizing on mobile, restore scroll position and body styles
        const scrollY = document.body.style.top;
        const scrollPosition = scrollY ? parseInt(scrollY.replace('px', '')) * -1 : 0;
        
        // Clear the fixed positioning styles
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
        document.body.style.top = '';
        
        // Restore scroll position
        if (scrollPosition > 0) {
          window.scrollTo(0, scrollPosition);
        }
        
        // If chat is still open on mobile, reapply mobile-specific styles for regular chat
        if (isOpen) {
          const newScrollY = window.scrollY;
          document.body.classList.add('chat-open');
          document.body.style.overflow = 'hidden';
          document.body.style.position = 'fixed';
          document.body.style.width = '100%';
          document.body.style.height = '100%';
          document.body.style.top = `-${newScrollY}px`;
        }
      }
      // On desktop, no body style restoration needed - just removing the CSS class is enough
    }

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

        // Focus on input field after command response
        focusInputField();

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

        // Focus on input field after command response
        focusInputField();

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

      // Focus on input field after reset
      focusInputField();

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
      'https://learn-flow-seven.vercel.app', // Vercel deployment (replace with your actual Vercel URL)                             // Same-origin relative path
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

        // Focus on input field after receiving response
        focusInputField();
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

          // Focus on input field after error message
          focusInputField();
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
    focusInputField(0)
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

  // Prevent scroll propagation to the background
  const preventScrollPropagation = (e: React.UIEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  // Handle touch events to prevent background scrolling
  const touchStartY = useRef<number>(0);

  const handleChatTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const handleChatTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault(); // Prevent all touch scrolling on the chat window itself
  };

  const handleChatTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  // Separate handlers for messages container to allow internal scrolling
  const handleMessagesTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    touchStartY.current = e.touches[0].clientY;
  };

  const handleMessagesTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();

    const target = e.currentTarget;
    const currentY = e.touches[0].clientY;
    const deltaY = touchStartY.current - currentY;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const height = target.clientHeight;

    // Only prevent default if we're at the boundaries and trying to scroll beyond
    if ((scrollTop <= 0 && deltaY < 0) ||
      (scrollTop + height >= scrollHeight && deltaY > 0)) {
      e.preventDefault();
    }
  };

  const handleMessagesTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <div className={`chatbot-container ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      {/* Notification bubble */}
      {showNotification && !isOpen && (
        <div className={`chat-notification ${isNotificationLeaving ? 'slide-down' : ''}`}>
          Need Help
        </div>
      )}

      {/* Chat toggle button */}
      <button
        className="chat-toggle-btn"
        onClick={toggleChat}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X size={24} /> : (
          <div className="flex items-center gap-2">
            <MessageSquare size={24} />
            <span className="chat-label">Chat</span>
          </div>
        )}
      </button>

      {/* Overlay for maximized chat */}
      {isOpen && isMaximized && <div className="chat-overlay" onClick={toggleMaximize}></div>}

      {/* Chat window */}
      {isOpen && (
        <div
          className={`chat-window ${isMaximized ? 'maximized' : ''}`}
          onWheel={preventScrollPropagation}
          onTouchStart={handleChatTouchStart}
          onTouchMove={handleChatTouchMove}
          onTouchEnd={handleChatTouchEnd}
        >
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

          <div
            className="messages-container"
            onScroll={preventScrollPropagation}
            onWheel={preventScrollPropagation}
            onTouchStart={handleMessagesTouchStart}
            onTouchMove={handleMessagesTouchMove}
            onTouchEnd={handleMessagesTouchEnd}
          >
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
                  <LoadingAnimation size="small" />
                  {/* <span>Thinking...</span> */}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div
            className="chat-input-container"
            onWheel={preventScrollPropagation}
            onTouchMove={preventScrollPropagation}
          >
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
            {/* <button
              className="suggestion-chip"
              onClick={() => setInput("Explain the concept of nanomaterials in CHB 101.")}
              disabled={isLoading}
            >
              Nanomaterials in CHB 101 */}
            {/* </button> */}
            <button
              className="suggestion-chip"
              onClick={() => {
                setInput("Give me Python code for a bubble sort algorithm.");
                focusInputField(0);
              }}
              disabled={isLoading}
              title="Get Python bubble sort code example"
              aria-label="Ask for Python bubble sort algorithm code"
            >
              Bubble sort in Python
            </button>
            <button
              className="suggestion-chip"
              onClick={() => {
                setInput("What are the latest advancements in quantum computing?");
                focusInputField(0);
              }}
              disabled={isLoading}
              title="Learn about quantum computing advancements"
              aria-label="Ask about latest quantum computing news"
            >
              Quantum computing news
            </button>
            <button
              className="suggestion-chip"
              onClick={() => {
                setInput("How do I find the course materials for CSE 2nd semester?");
                focusInputField(0);
              }}
              disabled={isLoading}
              title="Find CSE course materials"
              aria-label="Ask how to find CSE 2nd semester materials"
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