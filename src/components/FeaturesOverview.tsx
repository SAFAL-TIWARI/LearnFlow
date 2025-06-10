import React from 'react';
import { BookOpen, Calculator, Users, Download, Clock, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import FadeInElement from './FadeInElement';

const FeaturesOverview: React.FC = () => {
  const features = [
    {
      icon: <BookOpen className="w-8 h-8 text-blue-500" />,
      title: "Academic Resources",
      description: "Access comprehensive study materials, notes, assignments, and previous year question papers for all branches and semesters.",
      link: "/resources",
      linkText: "Browse Resources"
    },
    {
      icon: <Calculator className="w-8 h-8 text-green-500" />,
      title: "Student Tools",
      description: "Powerful tools including CGPA calculator, attendance tracker, and study planners to enhance your academic journey.",
      link: "/tools",
      linkText: "Explore Tools"
    },
    {
      icon: <Users className="w-8 h-8 text-purple-500" />,
      title: "Collaborative Learning",
      description: "Connect with peers, share knowledge, and collaborate on projects in a supportive learning environment.",
      link: "/help",
      linkText: "Learn More"
    },
    {
      icon: <Download className="w-8 h-8 text-orange-500" />,
      title: "Easy Downloads",
      description: "Download study materials, assignments, and resources with just one click. All files are organized and easily accessible.",
      link: "/resources",
      linkText: "Start Downloading"
    },
    {
      icon: <Clock className="w-8 h-8 text-red-500" />,
      title: "24/7 Access",
      description: "Access your learning materials anytime, anywhere. Study at your own pace with our always-available platform.",
      link: "/help",
      linkText: "Get Started"
    },
    {
      icon: <Shield className="w-8 h-8 text-indigo-500" />,
      title: "Secure & Reliable",
      description: "Your data is safe with us. We use industry-standard security measures to protect your information and privacy.",
      link: "/privacy-policy",
      linkText: "Privacy Policy"
    }
  ];

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <FadeInElement delay={100} direction="up" distance={30} duration={800}>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 font-bodoni">
                Why Choose LearnFlow?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-isidora">
                Discover the features that make LearnFlow the perfect companion for your educational journey. 
                From comprehensive resources to powerful tools, we've got everything you need to succeed.
              </p>
            </div>
          </FadeInElement>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FadeInElement 
                key={index}
                delay={200 + index * 100} 
                direction="up" 
                distance={30} 
                duration={500}
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 dark:border-gray-700">
                  {/* Icon */}
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 font-poppins">
                    {feature.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  {/* Link */}
                  <Link
                    to={feature.link}
                    className="inline-flex items-center text-learnflow-600 dark:text-learnflow-400 hover:text-learnflow-700 dark:hover:text-learnflow-300 font-medium transition-colors"
                  >
                    {feature.linkText}
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </FadeInElement>
            ))}
          </div>

          {/* Bottom CTA */}
          {/* <FadeInElement delay={500} direction="up" distance={30} duration={500}>
            <div className="text-center mt-12">
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                Ready to transform your learning experience?
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/resources"
                  className="bg-learnflow-600 hover:bg-learnflow-700 text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl font-poppins"
                >
                  Explore Resources
                </Link>
                <Link
                  to="/tools"
                  className="bg-white dark:bg-gray-800 text-learnflow-600 dark:text-learnflow-400 border-2 border-learnflow-600 dark:border-learnflow-400 hover:bg-learnflow-50 dark:hover:bg-gray-700 px-8 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl font-poppins"
                >
                  Try Our Tools
                </Link>
              </div>
            </div>
          </FadeInElement> */}
        </div>
      </div>
    </section>
  );
};

export default FeaturesOverview;
