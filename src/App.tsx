
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Navbar from "./components/Navbar";
// import Footer from "./components/Footer";
import Index from "./pages/Index";
import Tools from "./pages/Tools";
import Resources from "./pages/Resources";
import NotFound from "./pages/NotFound";
import CGPACalculator from "./pages/tools/CGPACalculator";
import StudyTimer from "./pages/tools/StudyTimer";
import ExamScheduler from "./pages/tools/ExamScheduler";
import NoteOrganizer from "./pages/tools/NoteOrganizer";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import AuthError from "./pages/auth-error";
import Login from "./pages/login";
import Signup from "./pages/signup";
import AuthCallback from "./pages/auth/callback";
import ForgotPassword from "./pages/forgot-password";
import ResetPassword from "./pages/auth/reset-password";
import HelpPage from "./pages/HelpPage";
import FeedbackPage from "./pages/FeedbackPage";
import NoticesPage from "./pages/NoticesPage";
import ReleaseNotesPage from "./pages/ReleaseNotesPage";
import ChatbotWidget from "./components/Chatbot/ChatbotWidget";
import GoToTopButton from "./components/GoToTopButton";
import NotificationManager from "./components/NotificationManager";
import ClickSparkAnimation from "./components/ClickSparkAnimation";
import { AuthProvider } from './context/SupabaseAuthContext';
import { AcademicProvider } from './context/AcademicContext';
import { ThemeProvider } from "./hooks/useTheme";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react"
import ProfilePageWrapper from './components/ProfilePageWrapper';
import AuthTestButton from './components/AuthTestButton';
// import './App.css';

// Create a client
const queryClient = new QueryClient();

const App = () => {
  React.useEffect(() => {
    // Check if there's a path parameter in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const pathParam = urlParams.get('path');

    // Check for INITIAL_PATH from the window object (set in our static HTML files)
    const initialPath = (window as any).INITIAL_PATH;

    if (pathParam) {
      // Remove the path parameter from the URL
      window.history.replaceState({}, document.title, window.location.pathname);

      // Navigate to the specified path
      if (pathParam === 'privacy-policy' || pathParam === 'terms-of-service') {
        window.history.pushState({}, document.title, '/' + pathParam);
      }
    } else if (initialPath) {
      // If INITIAL_PATH is set, ensure we're on that path
      window.history.replaceState({}, document.title, initialPath);
    }
  }, []);

  return (
    <React.StrictMode>
      <ErrorBoundary>
        <ThemeProvider>
          <AuthProvider>
            <QueryClientProvider client={queryClient}>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <AcademicProvider>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/tools" element={<Tools />} />
                      <Route path="/resources" element={<Resources />} />

                    {/* Tool Routes */}
                    <Route path="/tools/cgpa-calculator" element={<CGPACalculator />} />
                    <Route path="/tools/study-timer" element={<StudyTimer />} />
                    <Route path="/tools/exam-scheduler" element={<ExamScheduler />} />
                    <Route path="/tools/note-organizer" element={<NoteOrganizer />} />

                    {/* Legal Pages */}
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms-of-service" element={<TermsOfService />} />
                    <Route path="/help" element={<HelpPage />} />
                    <Route path="/feedback" element={<FeedbackPage />} />
                    <Route path="/notices" element={<NoticesPage />} />
                    <Route path="/release-notes" element={<ReleaseNotesPage />} />

                    {/* Auth Pages */}
                    <Route path="/auth-error" element={<AuthError />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/auth/reset-password" element={<ResetPassword />} />

                    {/* Profile Page */}
                    <Route path="/profile" element={<ProfilePageWrapper />} />

                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  </AcademicProvider>

                  {/* Chatbot Widget */}
                  <ChatbotWidget />

                  {/* Go To Top Button */}
                  <GoToTopButton />

                  {/* Notification Manager */}
                  <NotificationManager />

                  {/* Click Spark Animation */}
                  <ClickSparkAnimation />

                  {/* Auth Test Button (for development) */}
                  {process.env.NODE_ENV === 'development' && <AuthTestButton />}
                </BrowserRouter>
              </TooltipProvider>
            </QueryClientProvider>
          </AuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
      <SpeedInsights />
      <Analytics />
    </React.StrictMode>
  );
};

// Global error boundary
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Application error:", error, errorInfo);
  }


  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              The application encountered an error. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
};

export default App;
