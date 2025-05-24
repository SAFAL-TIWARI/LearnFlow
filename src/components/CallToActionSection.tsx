import React from 'react';
import { ArrowRight, BookOpen, Calculator, Users, Zap, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import FadeInElement from './FadeInElement';

const CallToActionSection: React.FC = () => {
  const benefits = [
    {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      text: "Access to 2500+ study resources"
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      text: "Powerful academic tools and calculators"
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      text: "24/7 platform availability"
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      text: "Join 15,000+ active students"
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      text: "100% free - no hidden costs"
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      text: "Regular updates and new features"
    }
  ];

  const quickActions = [
    {
      icon: <BookOpen className="w-6 h-6 text-blue-500" />,
      title: "Browse Resources",
      description: "Explore our vast library of academic materials",
      link: "/resources",
      color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30"
    },
    {
      icon: <Calculator className="w-6 h-6 text-green-500" />,
      title: "Try Tools",
      description: "Use our powerful student productivity tools",
      link: "/tools",
      color: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30"
    },
    {
      icon: <Users className="w-6 h-6 text-purple-500" />,
      title: "Join Community",
      description: "Connect with fellow students and share knowledge",
      link: "/help",
      color: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30"
    }
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Main CTA */}
          <FadeInElement delay={100} direction="up" distance={30} duration={800}>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 font-bodoni">
                Ready to Transform Your Learning?
              </h2>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto font-isidora">
                Join thousands of students who are already using LearnFlow to excel in their studies. 
                Start your journey to academic success today - it's completely free!
              </p>
            </div>
          </FadeInElement>

          {/* Benefits Grid */}
          <FadeInElement delay={300} direction="up" distance={30} duration={800}>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 mb-12">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center font-bodoni">
                What You Get with LearnFlow
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    {benefit.icon}
                    <span className="text-gray-700 dark:text-gray-300">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeInElement>

          {/* Quick Actions */}
          <FadeInElement delay={500} direction="up" distance={30} duration={800}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.link}
                  className={`p-6 rounded-xl border-2 ${action.color} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
                >
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      {action.icon}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 font-poppins">
                      {action.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {action.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </FadeInElement>

          {/* Primary CTA Buttons */}
          <FadeInElement delay={700} direction="up" distance={30} duration={800}>
            <div className="text-center mb-12">
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
                <Link
                  to="/resources"
                  className="group bg-learnflow-600 hover:bg-learnflow-700 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-poppins text-lg"
                >
                  <span className="flex items-center justify-center">
                    Get Started Now
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <Link
                  to="/tools"
                  className="group bg-white dark:bg-gray-700 text-learnflow-600 dark:text-learnflow-400 border-2 border-learnflow-600 dark:border-learnflow-400 hover:bg-learnflow-50 dark:hover:bg-gray-600 px-8 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-poppins text-lg"
                >
                  <span className="flex items-center justify-center">
                    Explore Tools
                    <Zap className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                  </span>
                </Link>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No registration required to browse resources • Sign in with Google for personalized features
              </p>
            </div>
          </FadeInElement>

          {/* Final Motivational Section */}
          <FadeInElement delay={900} direction="up" distance={30} duration={800}>
            <div className="bg-gradient-to-r from-learnflow-500 via-blue-500 to-purple-600 rounded-2xl p-8 md:p-12 text-white text-center">
              <div className="max-w-3xl mx-auto">
                <h3 className="text-2xl md:text-3xl font-bold mb-4 font-bodoni">
                  Your Academic Success Starts Here
                </h3>
                <p className="text-lg md:text-xl text-blue-100 mb-6 leading-relaxed">
                  Don't let another semester pass by struggling with scattered resources and inefficient study methods. 
                  Join LearnFlow today and experience the difference organized, quality education can make.
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-blue-100">15,000+ students online</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span className="text-blue-100">New resources added daily</span>
                  </div>
                </div>
              </div>
            </div>
          </FadeInElement>

          {/* Trust Indicators */}
          <FadeInElement delay={1100} direction="up" distance={30} duration={800}>
            <div className="text-center mt-12">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Trusted by students from top engineering colleges across India
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                <span>SATI Vidisha</span>
                <span>•</span>
                <span>IIT Delhi</span>
                <span>•</span>
                <span>NIT Bhopal</span>
                <span>•</span>
                <span>MANIT Bhopal</span>
                <span>•</span>
                <span>And 100+ more colleges</span>
              </div>
            </div>
          </FadeInElement>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;
