import React from 'react';
import { BookOpen, FileText, Download, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import FadeInElement from './FadeInElement';

const AcademicResourcesPreview: React.FC = () => {
  const resourceCategories = [
    {
      icon: <FileText className="w-6 h-6 text-blue-500" />,
      title: "Syllabi & Course Materials",
      description: "Complete syllabi for all branches with detailed course outlines and learning objectives.",
      count: "50+ Courses",
      color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
    },
    {
      icon: <BookOpen className="w-6 h-6 text-green-500" />,
      title: "Lecture Notes & Study Materials",
      description: "Comprehensive notes, presentations, and study guides created by top students and faculty.",
      count: "200+ Documents",
      color: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
    },
    {
      icon: <Download className="w-6 h-6 text-purple-500" />,
      title: "Previous Year Questions",
      description: "Extensive collection of PYQs with solutions to help you prepare for examinations.",
      count: "500+ Questions",
      color: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
    },
    {
      icon: <Users className="w-6 h-6 text-orange-500" />,
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
        <div className="max-w-6xl mx-auto">
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

          {/* Resource Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {resourceCategories.map((category, index) => (
              <FadeInElement
                key={index}
                delay={200 + index * 100}
                direction="up"
                distance={30}
                duration={500}
              >
                <div className={`p-6 rounded-xl border-2 ${category.color} hover:shadow-lg transition-all duration-300`}>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {category.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 font-poppins">
                        {category.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">
                        {category.description}
                      </p>
                      <span className="inline-block bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-medium">
                        {category.count}
                      </span>
                    </div>
                  </div>
                </div>
              </FadeInElement>
            ))}
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
