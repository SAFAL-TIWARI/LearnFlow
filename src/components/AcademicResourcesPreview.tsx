import React from 'react';
import { BookOpen, FileText, Download, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import FadeInElement from './FadeInElement';
import { VelocityResourceBoxes } from './VelocityResourceBoxes';

const AcademicResourcesPreview: React.FC = () => {
  
  // Box sizing configuration
  const boxConfig = {
    // Box dimensions and spacing
    mobile: {
      minWidth: "180px",     // Box width on mobile (adjust as needed: 160px, 200px, etc.)
      padding: "p-2",        // Internal padding (p-1, p-2, p-3, etc.)
      margin: "mr-2",        // Space between boxes (mr-1, mr-2, mr-3, etc.)
      borderRadius: "rounded-lg", // Corner radius (rounded-sm, rounded-lg, rounded-xl, etc.)
      spacing: "space-x-2"   // Space between icon and text (space-x-1, space-x-2, etc.)
    },
    tablet: {
      minWidth: "280px",
      padding: "sm:p-4",
      margin: "sm:mr-4",
      borderRadius: "sm:rounded-xl",
      spacing: "sm:space-x-3"
    },
    desktop: {
      minWidth: "320px",
      padding: "md:p-3",
      margin: "md:mr-5",
      borderRadius: "md:rounded-xl",
      spacing: "md:space-x-4"
    },
    // Animation and interaction
    hover: "hover:shadow-lg hover:scale-105", // Hover effects
    transition: "transition-all duration-80"  // Animation timing
  };

  // Text styling configuration
  const textConfig = {
    title: {
      // Font sizes for different screens
      mobile: "text-xs",     // Mobile font size (text-xs, text-sm, etc.)
      tablet: "sm:text-sm",  // Tablet font size
      desktop: "md:text-lg", // Desktop font size
      
      // Text styling
      fontWeight: "font-semibold",    // Font weight (font-medium, font-semibold, font-bold)
      lineHeight: "leading-tight",    // Line spacing (leading-tight, leading-normal, etc.)
      textAlign: "text-left",         // Text alignment (text-left, text-center, text-right)
      marginBottom: "mb-2 sm:mb-3",   // Bottom margin
      
      // Text overflow control
      maxHeight: "h-4 sm:h-6 md:h-6", // Fixed height for consistent layout
      overflow: "overflow-hidden"        // Hide overflow text
    },
    
    description: {
      // Font sizes
      mobile: "text-[10px]",  // Very small for mobile to fit more content
      tablet: "sm:text-xs",
      desktop: "md:text-sm",
      
      // Text styling
      lineHeight: "leading-tight",
      textAlign: "text-center",
      marginBottom: "mb-3 sm:mb-2 md:mb-3",
      
      // Text overflow control
      maxHeight: "h-15 sm:h-12 md:h-10", // Adjust height to control visible lines
      overflow: "overflow-hidden"
    },
    
    count: {
      // Font sizes
      mobile: "text-[9px]",
      tablet: "sm:text-xs",
      desktop: "md:text-xs",
      
      // Badge styling
      padding: "px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1",
      fontWeight: "font-medium",
      borderRadius: "rounded-full"
    },
    
    icon: {
      // Icon sizes
      mobile: "w-4 h-4",      // Small icons for mobile
      tablet: "sm:w-5 sm:h-5",
      desktop: "md:w-6 md:h-6"
    }
  };

  // Velocity scroll configuration
  const velocityConfig = {
    speed: 30,                    // Scroll speed (lower = slower, higher = faster)
    mobileBoxWidth: boxConfig.mobile.minWidth, // Mobile box width for velocity component
    mobileWordsPerLine: 3,        // Number of words per line in description for mobile (adjust as needed: 3, 4, 5, etc.)
    className: "py-1"             // Additional classes for velocity container
  };

  const resourceCategories = [
    {
      icon: <FileText className={`${textConfig.icon.mobile} ${textConfig.icon.tablet} ${textConfig.icon.desktop} text-blue-500`} />,
      title: "Syllabi & Course Materials",
      description: "Complete syllabi for all branches with detailed course outlines and learning objectives.",
      count: "50+ Courses",
      color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
    },
    {
      icon: <BookOpen className={`${textConfig.icon.mobile} ${textConfig.icon.tablet} ${textConfig.icon.desktop} text-green-500`} />,
      title: "Lecture Notes & Study Materials",
      description: "Comprehensive notes, presentations, and study guides created by top students and faculty.",
      count: "200+ Documents",
      color: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
    },
    {
      icon: <Download className={`${textConfig.icon.mobile} ${textConfig.icon.tablet} ${textConfig.icon.desktop} text-purple-500`} />,
      title: "Previous Year Questions",
      description: "Extensive collection of PYQs with solutions to help you prepare for examinations.",
      count: "500+ Questions",
      color: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
    },
    {
      icon: <Users className={`${textConfig.icon.mobile} ${textConfig.icon.tablet} ${textConfig.icon.desktop} text-orange-500`} />,
      title: "Lab Work & Practicals",
      description: "Step-by-step lab manuals, practical guides, and project documentation.",
      count: "100+ Practicals",
      color: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
    }
  ];

  const branches = [
    { name: "Computer Science", code: "CSE", students: "160+" },
    { name: "Blockchain Technology", code: "BCT", students: "78+" },
    { name: "Artificial Intelligence & Data Science", code: "AIADS", students: "75+" },
    { name: "Artificial Intelligence & Machine Learning", code: "AIML", students: "75+" },
    { name: "Cyber Security", code: "CS", students: "70+" },
    { name: "Internet of Things", code: "IoT", students: "75+" },
    { name: "Information Technology", code: "IT", students: "79+" },
    { name: "Electronics & Communication", code: "EC", students: "41+" },
    { name: "Electronics & Instrumentation", code: "EI", students: "4+" },
    { name: "Electrical Engineering", code: "EE", students: "36+" },
    { name: "Mechanical Engineering", code: "ME", students: "15+" },
    { name: "Civil Engineering", code: "CE", students: "36+" },
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="max-w-1xl mx-auto">
          {/* Section Header with Image */}
          <FadeInElement delay={100} direction="up" distance={30} duration={500}>
            <div className="text-center mb-12">
              <div className="flex justify-center mb-8">
                <img
                  src="/images/academic-resources.svg"
                  alt="Academic Resources Illustration"
                  className="w-full max-w-md h-auto opacity-80"
                />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 font-bodoni">
                Comprehensive Academic Resources
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-isidora">
                Access a vast library of educational materials curated specifically for engineering students.
                Everything you need to excel in your studies, all in one place.
              </p>
            </div>
          </FadeInElement>

          {/* Resource Categories Velocity Scroll */}
          <div className="mb-12">
            <VelocityResourceBoxes 
              defaultVelocity={velocityConfig.speed} 
              className={velocityConfig.className}
              mobileBoxWidth={velocityConfig.mobileBoxWidth}
              mobileWordsPerLine={velocityConfig.mobileWordsPerLine}
            >
              {resourceCategories.map((category, index) => (
                <div 
                  key={index}
                  className={`
                    ${boxConfig.mobile.padding} ${boxConfig.tablet.padding} ${boxConfig.desktop.padding}
                    ${boxConfig.mobile.borderRadius} ${boxConfig.tablet.borderRadius} ${boxConfig.desktop.borderRadius}
                    border-2 ${category.color} 
                    ${boxConfig.hover} ${boxConfig.transition}
                    min-w-[${boxConfig.mobile.minWidth}] sm:min-w-[${boxConfig.tablet.minWidth}] md:min-w-[${boxConfig.desktop.minWidth}] 
                    flex-shrink-0 ${boxConfig.mobile.margin} ${boxConfig.tablet.margin} ${boxConfig.desktop.margin}
                  `}
                >
                  <div className={`flex items-start ${boxConfig.mobile.spacing} ${boxConfig.tablet.spacing} ${boxConfig.desktop.spacing}`}>
                    <div className="flex-shrink-0 mt-0.5">
                      {category.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`
                        ${textConfig.title.mobile} ${textConfig.title.tablet} ${textConfig.title.desktop}
                        ${textConfig.title.fontWeight} ${textConfig.title.lineHeight} ${textConfig.title.marginBottom}
                        ${textConfig.title.maxHeight} ${textConfig.title.textAlign} ${textConfig.title.overflow}
                        text-gray-900 dark:text-white font-poppins
                      `}>
                        {category.title}
                      </h3>
                      <p className={`
                        ${textConfig.description.mobile} ${textConfig.description.tablet} ${textConfig.description.desktop}
                        ${textConfig.description.lineHeight} ${textConfig.description.marginBottom}
                        ${textConfig.description.maxHeight} ${textConfig.description.textAlign} ${textConfig.description.overflow}
                        text-gray-600 dark:text-gray-300
                      `}>
                        {category.description}
                      </p>
                      <span className={`
                        inline-block bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                        ${textConfig.count.padding} ${textConfig.count.borderRadius}
                        ${textConfig.count.mobile} ${textConfig.count.tablet} ${textConfig.count.desktop}
                        ${textConfig.count.fontWeight}
                      `}>
                        {category.count}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </VelocityResourceBoxes>
          </div>

          {/* Branches Overview */}
          <FadeInElement delay={500} direction="up" distance={30} duration={500}>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center font-bodoni">
                Available for All Engineering Branches
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {branches.map((branch, index) => (
                  <div key={index} className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <div className="text-lg font-bold text-learnflow-600 dark:text-learnflow-400 mb-1">
                      {branch.code}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {branch.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {branch.students} students
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeInElement>

          {/* CTA Section */}
          <FadeInElement delay={500} direction="up" distance={30} duration={500}>
            <div className="text-center mt-12">
              <div className="bg-gradient-to-r from-learnflow-500 to-learnflow-600 rounded-xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4 font-bodoni">
                  Start Exploring Resources Today
                </h3>
                <p className="text-learnflow-100 mb-6 max-w-2xl mx-auto">
                  Join thousands of students who are already using LearnFlow to enhance their learning experience.
                  Access premium study materials and boost your academic performance.
                </p>
                <Link
                  to="/resources"
                  className="inline-flex items-center bg-white text-learnflow-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-lg font-poppins"
                >
                  Browse All Resources
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

export default AcademicResourcesPreview;
