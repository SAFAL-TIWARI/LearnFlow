
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import BlurTextAnimation from './BlurTextAnimation';
import ProximityTextAnimation from './ProximityTextAnimation';
import FadeInElement from './FadeInElement';
import StarBorder from './StarBorder';
import { useAnalytics } from '../hooks/useAnalytics';

const Hero: React.FC = () => {
  const { liveStats, isLoading } = useAnalytics();

  return (
    <div className="relative bg-gradient-to-br from-gray-50 via-blue-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-800 py-20 md:py-24 lg:py-32 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-learnflow-500 rounded-full blur-xl"></div>
        <div className="absolute top-32 right-20 w-32 h-32 bg-purple-500 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-blue-500 rounded-full blur-xl"></div>
        <div className="absolute bottom-32 right-1/3 w-16 h-16 bg-green-500 rounded-full blur-xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <FadeInElement delay={50} direction="up" distance={20} duration={600}>
            <div className="inline-flex items-center bg-learnflow-100 dark:bg-learnflow-900/30 text-learnflow-700 dark:text-learnflow-300 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-learnflow-200 dark:border-learnflow-800">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              {isLoading ? '15,000+' : liveStats.totalVisitors.toLocaleString() + '+'} Students Already Learning
            </div>
          </FadeInElement>

          <FadeInElement delay={100} direction="up" distance={30} duration={800}>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 font-bodoni no-word-break leading-tight">
              <BlurTextAnimation
                text="Learning Made Simple"
                className="text-learnflow-800 dark:text-learnflow-200"
                speed={500}
              />
            </h1>
          </FadeInElement>

          <FadeInElement delay={300} direction="up" distance={10} duration={800}>
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed font-isidora whitespace-normal hyphens-none max-w-4xl mx-auto">
              <ProximityTextAnimation
                text="Access comprehensive academic resources, powerful student tools, and join a thriving community of learners. Everything you need to excel in your engineering studies."
                sensitivity={.15}
                maxDistance={100}
              />
            </p>
          </FadeInElement>

          {/* Stats */}
          <FadeInElement delay={400} direction="up" distance={20} duration={800}>
            <div className="flex flex-wrap justify-center gap-6 md:gap-8 mb-10 text-sm md:text-base">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                {isLoading ? '2500+' : liveStats.resourceCount.toLocaleString() + '+'} Resources
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                50+ Tools
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                100% Free
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></div>
                {isLoading ? '150+' : liveStats.onlineUsers.toLocaleString() + '+'} Online Now
              </div>
            </div>
          </FadeInElement>

          <FadeInElement delay={500} direction="up" distance={30} duration={800}>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <StarBorder
                as={Link}
                to="/resources"
                className="group"
                color="#0c8ee0" // Using learnflow-500 color
                speed="2s"
                title="Access academic resources and study materials"
                aria-label="Get started with LearnFlow resources"
              >
                <div className="flex items-center justify-center font-poppins text-lg px-2 py-0">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </StarBorder>

              <StarBorder
                as={Link}
                to="/search"
                className="group"
                color="#f59e0b" // Using amber-500 color
                speed="2s"
                title="Find and connect with other students"
                aria-label="Search for people on LearnFlow"
              >
                <div className="flex items-center justify-center font-poppins text-lg px-2 py-0">
                  Search People
                  <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </StarBorder>

              <StarBorder
                as={Link}
                to="/tools"
                className="group"
                color="#7c5cfc" // Using learnflow-purple color
                speed="2s"
                title="Discover student tools and utilities"
                aria-label="Explore LearnFlow student tools"
              >
                <span className="font-poppins text-lg px-2 py-1">Explore Tools</span>
              </StarBorder>
            </div>
          </FadeInElement>

          {/* Trust Indicators */}
          <FadeInElement delay={600} direction="up" distance={20} duration={800}>
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                Trusted by students from 100+ engineering colleges
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">SATI Vidisha</span>
                <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">MANIT Bhopal</span>
                <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">NIT Bhopal</span>
                <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">IIT Delhi</span>
              </div>
            </div>
          </FadeInElement>
        </div>
      </div>
    </div>
  );
};

export default Hero;
