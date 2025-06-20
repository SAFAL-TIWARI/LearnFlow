
import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Timer,
  Calendar,
  FileText,
  BookOpen,
  Activity,
  Clock,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';
import FadeInElement from './FadeInElement';
import StarBorder from './StarBorder';
import RollingGallery from './RollingGallery';
import ToolCard from './ToolCard';

// ===== ROLLING GALLERY ANIMATION SETTINGS =====
// Adjust these values to control the animation speed
const ROLLING_GALLERY_CONFIG = {
  // Drag sensitivity: Lower values = slower, more controlled scrolling
  // Recommended range: 0.01 (very slow) to 0.05 (fast)
  dragSensitivity: 0.005,
  
  // Autoplay duration: Time in seconds for one complete rotation
  // Recommended range: 20 (fast) to 60 (very slow)
  autoplayDuration: 30,
  
  // Enable/disable autoplay and pause on hover
  autoplay: true,
  pauseOnHover: true,
};
// ===============================================

interface ToolProps {
  name: string;
  description: string;
  route: string;
}

const toolIcons = {
  "CGPA Calculator": Calculator,
  "Study Timer": Timer,
  "Exam Scheduler": Calendar,
  "Note Organizer": FileText,
  "Flashcards": BookOpen,
  "Progress Tracker": Activity,
  "Attendance Tracker": Calendar,
  "Study Planner": Clock,
  "Performance Analytics": BarChart3,
  "Goal Tracker": Target,
  "Quick Tools": Zap,
};

const StudentTools: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTool, setSelectedTool] = useState<ToolProps | null>(null);
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const tools: ToolProps[] = [
    {
      name: "CGPA Calculator",
      description: "Calculate your Cumulative Grade Point Average based on your semester grades.",
      route: "/tools/cgpa-calculator"
    },
    {
      name: "Study Timer",
      description: "Track your study sessions with a Pomodoro timer to maximize productivity.",
      route: "/tools/study-timer"
    },
    {
      name: "Exam Scheduler",
      description: "Organize your exam preparation with a personalized schedule.",
      route: "/tools/exam-scheduler"
    },
    {
      name: "Note Organizer",
      description: "Take and organize class notes with easy categorization by subject.",
      route: "/tools/note-organizer"
    },
    {
      name: "Attendance Tracker",
      description: "Keep track of your attendance across all subjects and never miss important classes.",
      route: "/tools/attendance-tracker"
    },
    {
      name: "Study Planner",
      description: "Plan your study schedule effectively with our intelligent study planner and time management tools.",
      route: "/tools/study-planner"
    },
    {
      name: "Performance Analytics",
      description: "Analyze your academic performance with detailed insights and improvement suggestions.",
      route: "/tools/performance-analytics"
    },
    {
      name: "Goal Tracker",
      description: "Set and track your academic goals. Monitor your progress and celebrate achievements.",
      route: "/tools/goal-tracker"
    },
    {
      name: "Progress Tracker",
      description: "Monitor your academic progress and identify areas for improvement.",
      route: "/tools/progress-tracker"
    },
    {
      name: "Flashcards",
      description: "Create and study with digital flashcards for quick knowledge review.",
      route: "/tools/flashcards"
    },
    {
      name: "Quick Tools",
      description: "Access a collection of quick utility tools for everyday academic tasks and calculations.",
      route: "/tools/quick-tools"
    }
  ];

  const handleToolClick = (tool: ToolProps) => {
    setSelectedTool(tool);
    setTimeout(() => {
      navigate(tool.route);
    }, 300);
  };

  // Create tool cards for the rolling gallery
  const toolCards = tools.map((tool, index) => {
    const IconComponent = toolIcons[tool.name as keyof typeof toolIcons];
    return (
      <ToolCard
        key={index}
        name={tool.name}
        description={tool.description}
        route={tool.route}
        icon={<IconComponent className="w-8 h-8 text-white" />}
        onClick={() => handleToolClick(tool)}
      />
    );
  });

  return (
    <div id="student-tools" className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-900 scroll-mt-16">
      <div className="container mx-auto px-3 sm:px-4">
        <FadeInElement delay={50} direction="up" distance={20} duration={600}>
          <h2 className="text-3xl font-bold text-center mb-2 text-gray-800 dark:text-gray-100">Student Tools</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">Boost your productivity with our suite of academic tools</p>
        </FadeInElement>

        {/* Rolling Gallery for Tools */}
        <div className="mb-16 py-10 px-2 sm:px-4 md:px-6 bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-inner">
          <h3 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6 text-gray-800 dark:text-gray-100">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              Explore Our Tools
            </span>
          </h3>
          {/* <p className="text-center text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 px-4">
            <span className="hidden sm:inline">Drag to explore or </span>
            <span className="inline sm:hidden">Swipe to explore or </span>
            <span>Click on a tool to launch it</span>
          </p> */}
          <FadeInElement delay={100} direction="up" distance={30} duration={800}>
            <div className="mx-auto max-w-[1200px]">
              <RollingGallery
                autoplay={ROLLING_GALLERY_CONFIG.autoplay}
                pauseOnHover={ROLLING_GALLERY_CONFIG.pauseOnHover}
                items={toolCards}
                dragSensitivity={ROLLING_GALLERY_CONFIG.dragSensitivity}
                autoplayDuration={ROLLING_GALLERY_CONFIG.autoplayDuration}
              />
            </div>
          </FadeInElement>

          {/* Tool Names */}
          <div className="flex justify-center flex-wrap gap-2 sm:gap-3 md:gap-4 mt-6 sm:mt-8 px-2 sm:px-4">
            {tools.map((tool, index) => (
              <Button
                key={index}
                variant={selectedTool?.name === tool.name ? "default" : "outline"}
                className="transition-all duration-300 text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1 sm:py-2 h-auto"
                onClick={() => handleToolClick(tool)}
                title={`Select ${tool.name} tool`}
                aria-label={`Select ${tool.name} tool`}
              >
                {tool.name.length > 10 && windowWidth < 640
                  ? tool.name.split(' ')[0]
                  : tool.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Traditional Grid View (as a fallback or alternative view)
        <div className="flex items-center justify-center mb-8">
          <div className="h-0.5 bg-gray-200 dark:bg-gray-700 w-16 mr-4"></div>
          <h3 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">All Tools</h3>
          <div className="h-0.5 bg-gray-200 dark:bg-gray-700 w-16 ml-4"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => {
            const IconComponent = toolIcons[tool.name as keyof typeof toolIcons];

            // Calculate staggered delay based on index
            const staggerDelay = 100 + (index * 100);

            return (
              <FadeInElement
                key={index}
                delay={staggerDelay}
                direction="up"
                distance={30}
                duration={800}
                threshold={0.1}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <CardHeader className="text-white p-4" style={{ background: '#064b85', backgroundImage: 'none' }}>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold">{tool.name}</CardTitle>
                      <IconComponent className="w-8 h-8" style={{ opacity: 1 }} />
                    </div>
                  </CardHeader>
                  <CardContent className="p-5">
                    <CardDescription className="text-gray-600 dark:text-gray-300 text-base">
                      {tool.description}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="p-4 bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
                    <StarBorder
                      as="button"
                      onClick={tool.comingSoon ? undefined : () => handleToolClick(tool)}
                      className={tool.comingSoon ? "opacity-50 cursor-not-allowed" : ""}
                      color="#36aaf5" // Using learnflow-400 color
                      speed={`${5 + index * 0.5}s`} // Slightly different speeds for each button
                      aria-label={`Launch ${tool.name} ${tool.comingSoon ? '(Coming Soon)' : ''}`}
                      disabled={tool.comingSoon}
                    >
                      Launch Tool
                    </StarBorder>

                    {tool.comingSoon && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
                        Coming Soon
                      </Badge>
                    )}
                  </CardFooter>
                </Card>
              </FadeInElement>
            );
          })}
        </div> */}
      </div>
    </div>
  );
};

export default StudentTools;
