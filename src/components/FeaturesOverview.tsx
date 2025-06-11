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

  // Map the features to gallery items with all the necessary data
  const galleryItems = features.map((feature) => {
    // Convert the React SVG icon to an SVG string
    const iconString = renderToSVGString(feature.icon);
    
    return {
      bgColor: feature.color,
      text: feature.title,
      description: feature.description,
      icon: iconString,
      linkText: feature.linkText,
      link: feature.link
    };
  });
  
  // Helper function to convert React SVG elements to SVG strings
  function renderToSVGString(element: React.ReactElement): string {
    // This is a simplified version that works for our specific icons
    const icon = element.props.className.includes('BookOpen') ? 
      '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>' :
      element.props.className.includes('Calculator') ?
      '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h12a2 2 0 0 1 2 2v18H4V4a2 2 0 0 1 2-2z"></path><path d="M6 12a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-2Z"></path></svg>' :
      element.props.className.includes('Users') ?
      '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>' :
      element.props.className.includes('Download') ?
      '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>' :
      element.props.className.includes('Clock') ?
      '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>' :
      '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"></path></svg>';
    
    return icon;
  }

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

          {/* Circular Gallery */}
          <FadeInElement delay={200} direction="up" distance={30} duration={800}>
            <div style={{ height: '600px', position: 'relative' }} className="mb-12">
              <CircularGallery 
                items={galleryItems} 
                bend={3} 
                textColor="#ffffff" 
                borderRadius={0.05}
                font="bold 30px Figtree"
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
                  to="/tools"
                  className="bg-white dark:bg-gray-800 text-learnflow-600 dark:text-learnflow-400 border-2 border-learnflow-600 dark:border-learnflow-400 hover:bg-learnflow-50 dark:hover:bg-gray-700 px-8 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl font-poppins"
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
