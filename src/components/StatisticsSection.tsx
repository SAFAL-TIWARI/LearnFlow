import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Download, Award, TrendingUp, Clock } from 'lucide-react';
import FadeInElement from './FadeInElement';
import { useAnalytics } from '../hooks/useAnalytics';

const StatisticsSection: React.FC = () => {
  const { liveStats, isLoading } = useAnalytics();
  const [counters, setCounters] = useState({
    students: 0,
    resources: 0,
    downloads: 0,
    success: 0
  });

  const finalStats = {
    students: liveStats.totalVisitors,
    resources: liveStats.resourceCount,
    downloads: liveStats.downloadCount,
    success: Math.round(liveStats.successRate)
  };

  // Animated counter effect
  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60; // 60 steps for smooth animation
    const stepDuration = duration / steps;

    const incrementValues = {
      students: finalStats.students / steps,
      resources: finalStats.resources / steps,
      downloads: finalStats.downloads / steps,
      success: finalStats.success / steps
    };

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setCounters({
        students: Math.min(Math.floor(incrementValues.students * currentStep), finalStats.students),
        resources: Math.min(Math.floor(incrementValues.resources * currentStep), finalStats.resources),
        downloads: Math.min(Math.floor(incrementValues.downloads * currentStep), finalStats.downloads),
        success: Math.min(Math.floor(incrementValues.success * currentStep), finalStats.success)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setCounters(finalStats);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      icon: <Users className="w-8 h-8 text-blue-500" />,
      number: counters.students.toLocaleString(),
      suffix: "+",
      label: "Active Students",
      description: "Students actively using LearnFlow for their studies",
      color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
    },
    {
      icon: <BookOpen className="w-8 h-8 text-green-500" />,
      number: counters.resources.toLocaleString(),
      suffix: "+",
      label: "Study Resources",
      description: "Comprehensive academic materials available",
      color: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
    },
    {
      icon: <Download className="w-8 h-8 text-purple-500" />,
      number: counters.downloads.toLocaleString(),
      suffix: "+",
      label: "Downloads",
      description: "Resources downloaded by students this month",
      color: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
    },
    {
      icon: <Award className="w-8 h-8 text-orange-500" />,
      number: counters.success,
      suffix: "%",
      label: "Success Rate",
      description: "Students report improved academic performance",
      color: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
    }
  ];

  const achievements = [
    {
      icon: <TrendingUp className="w-6 h-6 text-green-500" />,
      title: "Growing Community",
      description: "Our student community grows by 500+ members every month"
    },
    {
      icon: <Clock className="w-6 h-6 text-blue-500" />,
      title: "24/7 Availability",
      description: "Access your study materials anytime, anywhere"
    },
    {
      icon: <Award className="w-6 h-6 text-purple-500" />,
      title: "Quality Assured",
      description: "All resources are verified and updated regularly"
    }
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <FadeInElement delay={100} direction="up" distance={30} duration={500}>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 font-bodoni">
                LearnFlow by the Numbers
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-isidora">
                Join a thriving community of students who are transforming their educational experience
                with LearnFlow's comprehensive platform.
              </p>
            </div>
          </FadeInElement>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <FadeInElement
                key={index}
                delay={200 + index * 100}
                direction="up"
                distance={30}
                duration={500}
              >
                <div className={`p-6 rounded-xl border-2 ${stat.color} text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                  <div className="flex justify-center mb-4">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {stat.number}{stat.suffix}
                  </div>
                  <div className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 font-poppins">
                    {stat.label}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.description}
                  </div>
                </div>
              </FadeInElement>
            ))}
          </div>

          {/* Achievements Section */}
          <FadeInElement delay={500} direction="up" distance={30} duration={500}>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center font-bodoni">
                What Makes Us Special
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {achievements.map((achievement, index) => (
                  <div key={index} className="text-center p-4">
                    <div className="flex justify-center mb-3">
                      {achievement.icon}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 font-poppins">
                      {achievement.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {achievement.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </FadeInElement>

          {/* Impact Statement */}
          <FadeInElement delay={500} direction="up" distance={30} duration={500}>
            <div className="text-center mt-12">
              <div className="bg-gradient-to-r from-learnflow-500 to-blue-600 rounded-xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4 font-bodoni">
                  Making Education Accessible for Everyone
                </h3>
                <p className="text-blue-100 mb-6 max-w-3xl mx-auto text-lg">
                  Our mission is to democratize education by providing free access to high-quality academic resources
                  and tools. Every student deserves the opportunity to excel, regardless of their background.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-2xl font-bold">100%</div>
                    <div className="text-sm text-blue-100">Free Platform</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-2xl font-bold">24/7</div>
                    <div className="text-sm text-blue-100">Support Available</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-2xl font-bold">∞</div>
                    <div className="text-sm text-blue-100">Learning Opportunities</div>
                  </div>
                </div>
              </div>
            </div>
          </FadeInElement>
        </div>
      </div>
    </section>
  );
};

export default StatisticsSection;
