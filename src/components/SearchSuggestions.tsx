import React from 'react';
import { Link } from 'react-router-dom';
import { Search, TrendingUp, ExternalLink } from 'lucide-react';
import { getTopSuggestions } from '../data/searchSuggestions';
import FadeInElement from './FadeInElement';

const SearchSuggestions: React.FC = () => {
  const topSuggestions = getTopSuggestions(5);

  return (
    <FadeInElement delay={700} direction="up" distance={20} duration={800}>
      <div className="max-w-2xl mx-auto mt-8">
        {/* Search suggestions container */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Search className="w-4 h-4" />
              <span className="font-medium">Popular searches</span>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
          </div>

          {/* Suggestions list */}
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {topSuggestions.map((suggestion, index) => (
              <Link
                key={suggestion.id}
                to={suggestion.link}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 group hover:shadow-sm"
                title={`Navigate to ${suggestion.title}`}
                aria-label={`Go to ${suggestion.title} - ${suggestion.description}`}
              >
                {/* Icon */}
                <div className="text-xl flex-shrink-0">
                  {suggestion.icon}
                </div>

                {/* Content */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <span className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {suggestion.title}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full whitespace-nowrap">
                      {suggestion.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-1 hidden sm:block">
                    {suggestion.description}
                  </p>
                </div>

                {/* Visit count and arrow */}
                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                  <span className="hidden sm:inline">{(suggestion.visitCount / 1000).toFixed(1)}k visits</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>

          {/* More results link */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <Link
              to="/tools"
              className="text-sm text-learnflow-600 dark:text-learnflow-400 hover:text-learnflow-700 dark:hover:text-learnflow-300 transition-colors flex items-center gap-1"
              title="View all tools and resources"
              aria-label="View more results and tools"
            >
              More results from LearnFlow »
            </Link>
          </div>
        </div>
      </div>
    </FadeInElement>
  );
};

export default SearchSuggestions;
