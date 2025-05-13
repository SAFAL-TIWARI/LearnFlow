
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { scrollToSection } from '../utils/scrollUtils';
import BlurTextAnimation from './BlurTextAnimation';
import ProximityTextAnimation from './ProximityTextAnimation';
import FadeInElement from './FadeInElement';
import StarBorder from './StarBorder';

const Hero: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-16 md:py-20 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <FadeInElement delay={100} direction="up" distance={30} duration={800}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 font-bodoni">
              <BlurTextAnimation
                text="Learning Made Simple"
                className="text-learnflow-800"
                speed={500}
              />
            </h1>
          </FadeInElement>

          <FadeInElement delay={300} direction="up" distance={10} duration={800}>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed font-isidora">
              <ProximityTextAnimation
                text="Access academic resources, track your progress, and enhance your learning journey with our suite of student tools."
                sensitivity={.15}
                maxDistance={100}
              />
            </p>
          </FadeInElement>

          <FadeInElement delay={500} direction="up" distance={30} duration={800}>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <StarBorder
                as="button"
                onClick={() => scrollToSection('academic-resources')}
                className="group"
                color="#0c8ee0" // Using learnflow-500 color
                speed="2s"
              >
                <div className="flex items-center justify-center font-poppins">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </StarBorder>

              <StarBorder
                as="button"
                onClick={() => scrollToSection('student-tools')}
                className="group"
                color="#7c5cfc" // Using learnflow-purple color
                speed="2s"
              >
                <span className="font-poppins">Explore Tools</span>
              </StarBorder>
            </div>
          </FadeInElement>
        </div>
      </div>
    </div>
  );
};

export default Hero;
