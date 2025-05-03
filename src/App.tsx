
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CustomSessionProvider from "./components/CustomSessionProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CGPACalculator from "./pages/tools/CGPACalculator";
import StudyTimer from "./pages/tools/StudyTimer";
import ExamScheduler from "./pages/tools/ExamScheduler";
import NoteOrganizer from "./pages/tools/NoteOrganizer";
import { SpeedInsights } from "@vercel/speed-insights/react";

// Create a client
const queryClient = new QueryClient();

const App = () => {
  return (
    <React.StrictMode>
      <ErrorBoundary>
        <CustomSessionProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  
                  {/* Tool Routes */}
                  <Route path="/tools/cgpa-calculator" element={<CGPACalculator />} />
                  <Route path="/tools/study-timer" element={<StudyTimer />} />
                  <Route path="/tools/exam-scheduler" element={<ExamScheduler />} />
                  <Route path="/tools/note-organizer" element={<NoteOrganizer />} />
                  
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </QueryClientProvider>
        </CustomSessionProvider>
      </ErrorBoundary>
      <SpeedInsights />
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
