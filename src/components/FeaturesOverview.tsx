import React from 'react';
import { BookOpen, Calculator, Users, Download, Clock, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import FadeInElement from './FadeInElement';
import CircularGallery from './CircularGallery';

const FeaturesOverview: React.FC = () => {
  const navigate = useNavigate();
  
  const features = [
    {
      icon: <BookOpen className="w-8 h-8 text-blue-500" />,
      title: "Academic Resources",
      description: "Access comprehensive study materials, notes, assignments, and previous year question papers for all branches and semesters.",
      link: "/resources",
      linkText: "Browse Resources",
      color: "#2563eb" // blue
    },
    {
      icon: <Calculator className="w-8 h-8 text-green-500" />,
      title: "Student Tools",
      description: "Powerful tools including CGPA calculator, attendance tracker, and study planners to enhance your academic journey.",
      link: "/tools",
      linkText: "Explore Tools",
      color: "#10b981" // green
    },
    {
      icon: <Users className="w-8 h-8 text-purple-500" />,
      title: "Collaborative Learning",
      description: "Connect with peers, share knowledge, and collaborate on projects in a supportive learning environment.",
      link: "/help",
      linkText: "Learn More",
      color: "#8b5cf6" // purple
    },
    {
      icon: <Download className="w-8 h-8 text-orange-500" />,
      title: "Easy Downloads",
      description: "Download study materials, assignments, and resources with just one click. All files are organized and easily accessible.",
      link: "/resources",
      linkText: "Start Downloading",
      color: "#f97316" // orange
    },
    {
      icon: <Clock className="w-8 h-8 text-red-500" />,
      title: "24/7 Access",
      description: "Access your learning materials anytime, anywhere. Study at your own pace with our always-available platform.",
      link: "/help",
      linkText: "Get Started",
      color: "#ef4444" // red
    },
    {
      icon: <Shield className="w-8 h-8 text-indigo-500" />,
      title: "Secure & Reliable",
      description: "Your data is safe with us. We use industry-standard security measures to protect your information and privacy.",
      link: "/privacy-policy",
      linkText: "Privacy Policy",
      color: "#6366f1" // indigo
    }
  ];

  // Helper function to get SVG icon based on feature title
  function getSVGIcon(title: string): string {
    switch (title) {
      case "Academic Resources":
        // Enhanced book with graduation cap and academic elements
        return '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path><path d="M12 7v14"></path><circle cx="12" cy="2" r="1.5" fill="#ffffff"></circle><path d="M8.5 0.5l3.5 1.5 3.5-1.5v3l-3.5 1.5-3.5-1.5z" fill="#ffffff"></path><path d="M6 9h4M6 12h4M6 15h4" stroke="#ffffff" stroke-width="1.5"></path></svg>';
      
      case "Student Tools":
        // Enhanced calculator with additional tool elements
        return '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"></rect><rect x="6" y="4" width="12" height="3" rx="1" fill="#ffffff"></rect><circle cx="8" cy="10" r="1" fill="#ffffff"></circle><circle cx="12" cy="10" r="1" fill="#ffffff"></circle><circle cx="16" cy="10" r="1" fill="#ffffff"></circle><circle cx="8" cy="14" r="1" fill="#ffffff"></circle><circle cx="12" cy="14" r="1" fill="#ffffff"></circle><circle cx="16" cy="14" r="1" fill="#ffffff"></circle><rect x="8" y="17" width="8" height="2" rx="1" fill="#ffffff"></rect><path d="M1 8l2 2-2 2M23 8l-2 2 2 2" stroke="#ffffff" stroke-width="1.5"></path></svg>';
      
      case "Collaborative Learning":
        // Enhanced users with connection network
        return '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path><path d="M9 11c2 0 4 1 6 2" stroke-dasharray="2,2" opacity="0.7"></path><path d="M3 13c2-1 4-2 6-2" stroke-dasharray="2,2" opacity="0.7"></path><circle cx="5" cy="16" r="1" fill="#ffffff"></circle><circle cx="19" cy="16" r="1" fill="#ffffff"></circle></svg>';
      
      case "Easy Downloads":
        // Enhanced download with cloud and progress indicator
        return '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29" opacity="0.6"></path><rect x="6" y="19" width="12" height="1" rx="0.5" fill="#ffffff" opacity="0.8"></rect><rect x="6" y="19" width="8" height="1" rx="0.5" fill="#00ff88"></rect></svg>';
      
      case "24/7 Access":
        // Enhanced clock with 24/7 indicator and availability symbols
        return '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline><circle cx="19" cy="5" r="2.5" fill="#00ff88" stroke="#00ff88"></circle><text x="19" y="6" text-anchor="middle" font-size="6" fill="#000" font-weight="bold">24/7</text><path d="M2 2l2 2M2 22l2-2M22 2l-2 2M22 22l-2-2" stroke="#ffffff" stroke-width="1.5" opacity="0.7"></path></svg>';
      
      case "Secure & Reliable":
        // Enhanced shield with security elements and checkmark
        return '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"></path><polyline points="9 12 11 14 15 10" stroke-width="3"></polyline><circle cx="6" cy="8" r="1" fill="#ffffff" opacity="0.6"></circle><circle cx="18" cy="8" r="1" fill="#ffffff" opacity="0.6"></circle><path d="M12 1v4M8 3l8 0" stroke="#ffffff" stroke-width="1.5" opacity="0.7"></path></svg>';
      
      default:
        // Fallback generic icon
        return '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    }
  }

  // Map the features to gallery items with all the necessary data
  const galleryItems = features.map((feature) => {
    return {
      bgColor: feature.color,
      text: feature.title,
      description: feature.description,
      icon: getSVGIcon(feature.title),
      linkText: feature.linkText,
      link: feature.link
    };
  });

  return (
    <section className="py-1 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-1xl mx-auto">
          {/* Section Header */}
          <FadeInElement delay={100} direction="up" distance={30} duration={800}>
            <div className="text-center mb-1">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 font-bodoni">
                Why Choose LearnFlow?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-isidora">
                Discover the features that make LearnFlow the perfect companion for your educational journey. 
                From comprehensive resources to powerful tools, we've got everything you need to succeed.
              </p>
            </div>
          </FadeInElement>

          {/* Circular Gallery */}
          <FadeInElement delay={200} direction="up" distance={30} duration={800}>
            <div style={{ height: '600px', position: 'relative' }} className="mb-1">
              <CircularGallery 
                items={galleryItems} 
                bend={3} 
                textColor="#ffffff" 
                borderRadius={0.05}
                font="bold 50px Figtree"
                autoplay={true}
                autoplaySpeed={0.02}
                pauseOnHover={true}
                autoplayDirection="right" 
              />
            </div>
          </FadeInElement>

          {/* Bottom CTA */}
          <FadeInElement delay={500} direction="up" distance={30} duration={500}>
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
                  to="/search"
                  className="bg-white dark:bg-gray-800 text-learnflow-600 dark:text-learnflow-400 border-2 border-learnflow-600 dark:border-learnflow-400 hover:bg-gray-300 dark:hover:bg-gray-700 px-8 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl font-poppins"
                >
                  Search People
                </Link>
                <Link
                  to="/tools"
                  className="bg-red-600 dark:bg-red-500 text-white dark:text-white dark:text-learnflow-100 border-20 border-learnflow-600 dark:border-learnflow-400 hover:bg-red-700 dark:hover:bg-red-700 px-8 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl font-poppins"
                >
                  Try Our Tools
                </Link>
              </div>
            </div>
          </FadeInElement>
        </div>
      </div>
    </section>
  );
};

export default FeaturesOverview;
