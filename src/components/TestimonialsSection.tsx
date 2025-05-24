import React, { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, User } from 'lucide-react';
import FadeInElement from './FadeInElement';

const TestimonialsSection: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Priya Sharma",
      role: "CSE Student, 3rd Year",
      branch: "Computer Science Engineering",
      rating: 5,
      text: "LearnFlow has been a game-changer for my studies. The CGPA calculator helped me track my progress, and the extensive resource library saved me countless hours of searching for study materials.",
      avatar: "PS",
      color: "bg-blue-500"
    },
    {
      id: 2,
      name: "Rahul Kumar",
      role: "IT Student, 2nd Year",
      branch: "Information Technology",
      rating: 5,
      text: "The previous year question papers and solutions available on LearnFlow helped me prepare effectively for my exams. I improved my grades significantly after using this platform.",
      avatar: "RK",
      color: "bg-green-500"
    },
    {
      id: 3,
      name: "Ananya Patel",
      role: "EC Student, 4th Year",
      branch: "Electronics & Communication",
      rating: 5,
      text: "As a final year student, LearnFlow's project resources and lab manuals were incredibly helpful. The platform is well-organized and easy to navigate.",
      avatar: "AP",
      color: "bg-purple-500"
    },
    {
      id: 4,
      name: "Vikash Singh",
      role: "ME Student, 1st Year",
      branch: "Mechanical Engineering",
      rating: 5,
      text: "Being a first-year student, I was overwhelmed with the coursework. LearnFlow's study planner and organized resources helped me stay on track and manage my time effectively.",
      avatar: "VS",
      color: "bg-orange-500"
    },
    {
      id: 5,
      name: "Sneha Gupta",
      role: "EE Student, 3rd Year",
      branch: "Electrical Engineering",
      rating: 5,
      text: "The collaborative features and comprehensive study materials on LearnFlow made group projects much easier. It's like having a study buddy available 24/7.",
      avatar: "SG",
      color: "bg-pink-500"
    }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentData = testimonials[currentTestimonial];

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <FadeInElement delay={100} direction="up" distance={30} duration={800}>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 font-bodoni">
                What Students Say About LearnFlow
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-isidora">
                Hear from real students who have transformed their academic journey with LearnFlow. 
                Their success stories inspire us to keep improving.
              </p>
            </div>
          </FadeInElement>

          {/* Main Testimonial */}
          <FadeInElement delay={300} direction="up" distance={30} duration={800}>
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-12 shadow-xl mb-8">
              {/* Quote Icon */}
              <div className="absolute top-6 left-6 text-learnflow-200 dark:text-learnflow-800">
                <Quote className="w-12 h-12" />
              </div>

              {/* Navigation Buttons */}
              <div className="absolute top-6 right-6 flex space-x-2">
                <button
                  onClick={prevTestimonial}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={nextTestimonial}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Testimonial Content */}
              <div className="mt-8">
                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(currentData.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Text */}
                <blockquote className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-6 leading-relaxed font-isidora">
                  "{currentData.text}"
                </blockquote>

                {/* Author Info */}
                <div className="flex items-center">
                  <div className={`w-12 h-12 ${currentData.color} rounded-full flex items-center justify-center text-white font-bold mr-4`}>
                    {currentData.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white font-poppins">
                      {currentData.name}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      {currentData.role}
                    </div>
                    <div className="text-learnflow-600 dark:text-learnflow-400 text-sm">
                      {currentData.branch}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Indicators */}
              <div className="flex justify-center mt-8 space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentTestimonial
                        ? 'bg-learnflow-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </FadeInElement>

          {/* Additional Testimonials Grid */}
          <FadeInElement delay={500} direction="up" distance={30} duration={800}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.slice(0, 3).map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm leading-relaxed">
                    "{testimonial.text.substring(0, 120)}..."
                  </p>
                  <div className="flex items-center">
                    <div className={`w-8 h-8 ${testimonial.color} rounded-full flex items-center justify-center text-white text-sm font-bold mr-3`}>
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {testimonial.name}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </FadeInElement>

          {/* CTA Section */}
          <FadeInElement delay={700} direction="up" distance={30} duration={800}>
            <div className="text-center mt-12">
              <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4 font-bodoni">
                  Join the Success Stories
                </h3>
                <p className="text-green-100 mb-6 max-w-2xl mx-auto">
                  Become part of our growing community of successful students. Start your journey with LearnFlow today 
                  and experience the difference quality resources can make.
                </p>
                <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-lg font-poppins">
                  Start Your Success Story
                </button>
              </div>
            </div>
          </FadeInElement>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
