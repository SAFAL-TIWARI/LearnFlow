
import React from 'react';
import { 
  Calculator,
  Timer,
  Calendar,
  FileText,
  BookOpen,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';
import FadeInElement from './FadeInElement';
import StarBorder from './StarBorder';

interface ToolProps {
  name: string;
  description: string;
  route: string;
  comingSoon?: boolean;
}

const toolIcons = {
  "CGPA Calculator": Calculator,
  "Study Timer": Timer,
  "Exam Scheduler": Calendar,
  "Note Organizer": FileText,
  "Flashcards": BookOpen,
  "Progress Tracker": Activity,
};

const StudentTools: React.FC = () => {
  const navigate = useNavigate();
  
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
      name: "Flashcards",
      description: "Create and study with digital flashcards for quick knowledge review.",
      route: "#",
      comingSoon: true
    },
    {
      name: "Progress Tracker",
      description: "Monitor your academic progress and identify areas for improvement.",
      route: "#",
      comingSoon: true
    }
  ];

  const handleToolClick = (tool: ToolProps) => {
    if (tool.comingSoon) return;
    navigate(tool.route);
  };

  return (
    <div id="student-tools" className="py-16 bg-gray-50 dark:bg-gray-900 scroll-mt-16">
      <div className="container mx-auto px-4">
        <FadeInElement delay={50} direction="up" distance={20} duration={600}>
          <h2 className="text-3xl font-bold text-center mb-2 text-gray-800 dark:text-gray-100">Student Tools</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12">Boost your productivity with our suite of academic tools</p>
        </FadeInElement>
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
                    {tool.comingSoon ? (
                      <Button 
                        disabled
                        className="opacity-50 cursor-not-allowed"
                        aria-label={`Launch ${tool.name} (Coming Soon)`}
                      >
                        Launch Tool
                      </Button>
                    ) : (
                      <StarBorder
                        as="button"
                        onClick={() => handleToolClick(tool)}
                        className=""
                        color="#36aaf5" // Using learnflow-400 color
                        speed={`${5 + index * 0.5}s`} // Slightly different speeds for each button
                        aria-label={`Launch ${tool.name}`}
                      >
                        Launch Tool
                      </StarBorder>
                    )}
                    
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
        </div>
      </div>
    </div>
  );
};

export default StudentTools;
