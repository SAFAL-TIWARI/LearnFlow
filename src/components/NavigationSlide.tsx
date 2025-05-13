import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import FadeInElement from './FadeInElement';
import StarBorder from './StarBorder';

const NavigationSlide: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-gray-100 to-white dark:from-gray-800 dark:to-gray-700 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <FadeInElement delay={100} direction="up" distance={30} duration={800}>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 font-bodoni">
              Discover LearnFlow Resources
            </h2>
          </FadeInElement>

          <FadeInElement delay={300} direction="up" distance={10} duration={800}>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed font-isidora">
              Access our comprehensive collection of academic materials and productivity tools designed to enhance your learning experience.
            </p>
          </FadeInElement>

          <FadeInElement delay={500} direction="up" distance={30} duration={800}>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <StarBorder
                as={Link}
                to="/resources"
                className="group"
                color="#0c8ee0"
                speed="2s"
              >
                <div className="flex items-center justify-center font-poppins">
                  Academic Resources
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </StarBorder>

              <StarBorder
                as={Link}
                to="/tools"
                className="group"
                color="#7c5cfc"
                speed="2s"
              >
                <div className="flex items-center justify-center font-poppins">
                  Explore Tools
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </StarBorder>
            </div>
          </FadeInElement>
        </div>
      </div>
    </div>
  );
};

export default NavigationSlide;