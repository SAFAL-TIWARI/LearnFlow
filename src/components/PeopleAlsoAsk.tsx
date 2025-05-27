import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, HelpCircle, ExternalLink } from 'lucide-react';
import { peopleAlsoAskData } from '../data/peopleAlsoAsk';
import FadeInElement from './FadeInElement';

const PeopleAlsoAsk: React.FC = () => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <FadeInElement delay={100} direction="up" distance={30} duration={800}>
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <HelpCircle className="w-6 h-6 text-learnflow-600 dark:text-learnflow-400" />
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white font-bodoni">
                  People Also Ask
                </h2>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-isidora">
                Find answers to the most common questions from engineering students
              </p>
            </div>
          </FadeInElement>

          {/* FAQ Items */}
          <div className="space-y-4">
            {peopleAlsoAskData.map((item, index) => (
              <FadeInElement
                key={item.id}
                delay={200 + index * 100}
                direction="up"
                distance={20}
                duration={600}
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {/* Question */}
                  <button
                    onClick={() => toggleExpanded(item.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    aria-expanded={expandedItems.has(item.id)}
                    aria-controls={`answer-${item.id}`}
                    title={`Toggle answer for: ${item.question}`}
                  >
                    <span className="font-medium text-gray-900 dark:text-white pr-4 font-alegreya">
                      {item.question}
                    </span>
                    <div className="flex-shrink-0">
                      {expandedItems.has(item.id) ? (
                        <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Answer */}
                  <div
                    id={`answer-${item.id}`}
                    className={`transition-all duration-300 ease-in-out ${
                      expandedItems.has(item.id)
                        ? 'max-h-96 opacity-100'
                        : 'max-h-0 opacity-0 overflow-hidden'
                    }`}
                  >
                    <div className="px-6 pb-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="pt-4">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 font-roboto">
                          {item.answer}
                        </p>

                        {/* Related Links */}
                        {item.relatedLinks && item.relatedLinks.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {item.relatedLinks.map((link, linkIndex) => (
                              <Link
                                key={linkIndex}
                                to={link.url}
                                className="inline-flex items-center gap-1 text-sm text-learnflow-600 dark:text-learnflow-400 hover:text-learnflow-700 dark:hover:text-learnflow-300 transition-colors bg-learnflow-50 dark:bg-learnflow-900/20 px-3 py-1 rounded-full border border-learnflow-200 dark:border-learnflow-800"
                                title={`Navigate to ${link.text}`}
                                aria-label={`Go to ${link.text}`}
                              >
                                {link.text}
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </FadeInElement>
            ))}
          </div>

          {/* More Help Link */}
          <FadeInElement delay={800} direction="up" distance={20} duration={600}>
            <div className="text-center mt-8">
              <Link
                to="/help"
                className="inline-flex items-center gap-2 text-learnflow-600 dark:text-learnflow-400 hover:text-learnflow-700 dark:hover:text-learnflow-300 transition-colors font-medium"
                title="Visit help center for more assistance"
                aria-label="Get more help and support"
              >
                Need more help? Visit our Help Center
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </FadeInElement>
        </div>
      </div>
    </section>
  );
};

export default PeopleAlsoAsk;
