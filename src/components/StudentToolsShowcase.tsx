import React from 'react';
import { Calculator, Calendar, Clock, BarChart3, Target, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import FadeInElement from './FadeInElement';
import { useAnalytics } from '../hooks/useAnalytics';

const StudentToolsShowcase: React.FC = () => {
  const { liveStats, isLoading } = useAnalytics();

  const tools = [
    {
      icon: <Calculator className="w-8 h-8 text-blue-500" />,
      title: "CGPA Calculator",
      description: "Calculate your CGPA with ease. Track your academic progress and set goals for future semesters.",
      features: ["Semester-wise calculation", "Grade point tracking", "Goal setting"],
      link: "/tools/cgpa-calculator",
      popular: true
    },
    {
      icon: <Calendar className="w-8 h-8 text-green-500" />,
      title: "Attendance Tracker",
      description: "Keep track of your attendance across all subjects and never miss important classes.",
      features: ["Subject-wise tracking", "Attendance alerts", "Visual reports"],
      link: "/tools/attendance-tracker",
      popular: false
    },
    {
      icon: <Clock className="w-8 h-8 text-purple-500" />,
      title: "Study Planner",
      description: "Plan your study schedule effectively with our intelligent study planner and time management tools.",
      features: ["Smart scheduling", "Progress tracking", "Reminder system"],
      link: "/tools/study-planner",
      popular: false
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-orange-500" />,
      title: "Performance Analytics",
      description: "Analyze your academic performance with detailed insights and improvement suggestions.",
      features: ["Performance metrics", "Trend analysis", "Improvement tips"],
      link: "/tools/performance-analytics",
      popular: false
    },
    {
      icon: <Target className="w-8 h-8 text-red-500" />,
      title: "Goal Tracker",
      description: "Set and track your academic goals. Monitor your progress and celebrate achievements.",
      features: ["Goal setting", "Progress monitoring", "Achievement badges"],
      link: "/tools/goal-tracker",
      popular: false
    },
    {
      icon: <Zap className="w-8 h-8 text-indigo-500" />,
      title: "Quick Tools",
      description: "Access a collection of quick utility tools for everyday academic tasks and calculations.",
      features: ["Unit converters", "Formula references", "Quick calculations"],
      link: "/tools/quick-tools",
      popular: false
    }
  ];

  const stats = [
    {
      number: isLoading ? "1000+" : liveStats.calculationsPerformed.toLocaleString() + "+",
      label: "Calculations Performed",
      icon: <Calculator className="w-6 h-6" />
    },
    {
      number: isLoading ? "1,000+" : liveStats.studentsHelped.toLocaleString() + "+",
      label: "Students Helped",
      icon: <Target className="w-6 h-6" />
    },
    {
      number: isLoading ? "95%" : Math.round(liveStats.accuracyRate) + "%",
      label: "Accuracy Rate",
      icon: <BarChart3 className="w-6 h-6" />
    },
    {
      number: "24/7",
      label: "Available",
      icon: <Clock className="w-6 h-6" />
    }
  ];

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-1xl mx-auto">
          {/* Section Header with Image */}
          <FadeInElement delay={100} direction="up" distance={30} duration={500}>
            <div className="text-center mb-12">
              <div className="flex justify-center mb-8">
                <img
                  src="/images/student-tools.svg"
                  alt="Student Tools Illustration"
                  className="w-full max-w-lg h-auto opacity-100 dark:opacity-100"
                />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 font-bodoni">
                Powerful Student Tools
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-6xl mx-auto font-isidora">
                Boost your productivity and academic performance with our suite of intelligent tools
                designed specifically for engineering students.
              </p>
            </div>
          </FadeInElement>

          {/* Tools Grid Removed from Home Page */}

          {/* Stats Section */}
          <FadeInElement delay={500} direction="up" distance={30} duration={500}>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center font-bodoni">
                Trusted by Students Everywhere
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="flex justify-center mb-2 text-learnflow-500">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeInElement>

          {/* CTA Section */}
          <FadeInElement delay={500} direction="up" distance={30} duration={500}>
            <div className="text-center mt-12">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4 font-bodoni">
                  Ready to Boost Your Productivity?
                </h3>
                <p className="text-purple-100 mb-6 max-w-6xl mx-auto">
                  Join thousands of students who are already using our tools to improve their academic performance
                  and streamline their study process.
                </p>
                <Link
                  to="/tools"
                  className="inline-flex items-center bg-white text-purple-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-lg font-poppins"
                >
                  Explore All Tools
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
          </FadeInElement>
        </div>
      </div>
    </section>
  );
};

export default StudentToolsShowcase;
