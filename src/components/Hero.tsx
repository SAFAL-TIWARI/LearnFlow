
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { scrollToSection } from '../utils/scrollUtils';

const Hero: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-16 md:py-20 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="text-learnflow-800">Learning Made Simple</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Access academic resources, track your progress, and enhance your learning journey with our suite of student tools.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => scrollToSection('academic-resources')}
              className="group px-8 py-3 bg-learnflow-600 hover:bg-learnflow-700 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button 
              onClick={() => scrollToSection('student-tools')}
              className="px-8 py-3 bg-white dark:bg-gray-700 text-learnflow-600 dark:text-learnflow-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full font-medium border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-300"
            >
              Explore Tools
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
