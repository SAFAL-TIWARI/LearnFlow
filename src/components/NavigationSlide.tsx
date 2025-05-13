import React from 'react';
import FadeInElement from './FadeInElement';

const NavigationSlide: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-gray-100 to-white dark:from-gray-800 dark:to-gray-700 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <FadeInElement delay={100} direction="up" distance={30} duration={800}>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 font-bodoni">
              {/* Discover LearnFlow Resources */}
            </h2>
          </FadeInElement>

          <FadeInElement delay={300} direction="up" distance={10} duration={800}>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed font-isidora">
              {/* Access our comprehensive collection of academic materials and productivity tools designed to enhance your learning experience. */}
            </p>
          </FadeInElement>

          {/* Removed navigation buttons as requested */}
        </div>
      </div>
    </div>
  );
};

export default NavigationSlide;