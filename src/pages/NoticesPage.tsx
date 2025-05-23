import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { format, parseISO } from 'date-fns';
import { Bell, AlertTriangle, Info, Calendar, Clock, ChevronDown, ChevronUp, ExternalLink, FileText, Tag } from 'lucide-react';

// Define the Notice interface
interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  expiry_date: string | null;
  attachment_url: string | null;
  tags: string[];
}

const NoticesPage: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedNotice, setExpandedNotice] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'priority'>('newest');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  // Sample notice categories
  const categories = [
    { id: 'all', name: 'All Notices', icon: <Bell className="w-5 h-5" /> },
    { id: 'academic', name: 'Academic', icon: <FileText className="w-5 h-5" /> },
    { id: 'exam', name: 'Examination', icon: <Calendar className="w-5 h-5" /> },
    { id: 'event', name: 'Events', icon: <Info className="w-5 h-5" /> },
    { id: 'important', name: 'Important', icon: <AlertTriangle className="w-5 h-5" /> }
  ];

  // Sample notices data (will be replaced with Supabase data in production)
  const sampleNotices: Notice[] = [
    {
      id: '1',
      title: 'End Semester Examination Schedule',
      content: 'The end semester examinations for all branches will commence from July 10, 2024. The detailed schedule has been attached. Students are advised to check their respective examination centers and timings.',
      category: 'exam',
      priority: 'high',
      created_at: '2024-06-15T10:00:00Z',
      expiry_date: '2024-07-15T00:00:00Z',
      attachment_url: 'https://example.com/exam-schedule.pdf',
      tags: ['examination', 'schedule', 'important']
    },
    {
      id: '2',
      title: 'Workshop on Artificial Intelligence',
      content: 'The Department of Computer Science is organizing a two-day workshop on "Recent Advances in Artificial Intelligence and Machine Learning" on June 25-26, 2024. Interested students can register through the link provided.',
      category: 'event',
      priority: 'medium',
      created_at: '2024-06-12T14:30:00Z',
      expiry_date: '2024-06-26T00:00:00Z',
      attachment_url: null,
      tags: ['workshop', 'AI', 'ML', 'computer science']
    },
    {
      id: '3',
      title: 'Library Book Return Notice',
      content: 'All students are hereby informed that library books must be returned by June 30, 2024. Failure to return books will result in a fine as per library rules. Students with pending returns will not be allowed to appear for the end semester examinations.',
      category: 'academic',
      priority: 'medium',
      created_at: '2024-06-10T09:15:00Z',
      expiry_date: '2024-06-30T00:00:00Z',
      attachment_url: null,
      tags: ['library', 'books', 'return']
    },
    {
      id: '4',
      title: 'Scholarship Application Deadline Extended',
      content: 'The deadline for submitting applications for the Merit Scholarship has been extended to July 5, 2024. Eligible students who have not yet applied are encouraged to submit their applications at the earliest.',
      category: 'important',
      priority: 'high',
      created_at: '2024-06-08T11:45:00Z',
      expiry_date: '2024-07-05T00:00:00Z',
      attachment_url: 'https://example.com/scholarship-form.pdf',
      tags: ['scholarship', 'application', 'deadline']
    },
    {
      id: '5',
      title: 'Summer Internship Opportunities',
      content: 'Various companies have announced summer internship opportunities for pre-final year students. The Training and Placement Cell has organized an information session on June 20, 2024, at 3:00 PM in the Main Auditorium. All interested students are requested to attend.',
      category: 'academic',
      priority: 'medium',
      created_at: '2024-06-05T16:20:00Z',
      expiry_date: '2024-06-20T00:00:00Z',
      attachment_url: null,
      tags: ['internship', 'placement', 'career']
    },
    {
      id: '6',
      title: 'Campus Maintenance Schedule',
      content: 'The campus maintenance work will be carried out from June 18-20, 2024. During this period, certain areas of the campus may have restricted access. Students are requested to cooperate with the maintenance staff.',
      category: 'event',
      priority: 'low',
      created_at: '2024-06-02T13:10:00Z',
      expiry_date: '2024-06-20T00:00:00Z',
      attachment_url: null,
      tags: ['maintenance', 'campus', 'facilities']
    },
    {
      id: '7',
      title: 'Change in Academic Calendar',
      content: 'Due to unforeseen circumstances, there has been a slight modification in the academic calendar. The last working day for the current semester will now be July 5, 2024, instead of June 30, 2024. All other dates remain unchanged.',
      category: 'important',
      priority: 'high',
      created_at: '2024-05-28T10:30:00Z',
      expiry_date: null,
      attachment_url: 'https://example.com/revised-academic-calendar.pdf',
      tags: ['academic calendar', 'important', 'schedule change']
    }
  ];

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        setError(null);

        // In a real implementation, fetch from Supabase
        // const { data, error } = await supabase
        //   .from('notices')
        //   .select('*')
        //   .order('created_at', { ascending: false });

        // if (error) throw error;
        
        // For now, use sample data
        // Simulate API delay
        setTimeout(() => {
          setNotices(sampleNotices);
          setLoading(false);
        }, 800);
        
      } catch (error) {
        console.error('Error fetching notices:', error);
        setError('Failed to load notices. Please try again later.');
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  // Filter and sort notices
  const filteredNotices = notices
    .filter(notice => {
      // Filter by category
      if (filter !== 'all' && notice.category !== filter) return false;
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          notice.title.toLowerCase().includes(query) ||
          notice.content.toLowerCase().includes(query) ||
          notice.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by selected criteria
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        // Sort by priority (high -> medium -> low)
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
    });

  // Toggle notice expansion
  const toggleNotice = (id: string) => {
    setExpandedNotice(expandedNotice === id ? null : id);
  };

  // Get priority color class
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => window.location.href = '/'}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Go back to home page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Notices & Updates</h1>
        </div>

        <motion.div
          className="mb-8"
          initial="hidden"
          animate="visible"
          variants={fadeVariants}
        >
          <p className="text-gray-600 dark:text-gray-400">
            Stay updated with the latest announcements, events, and important information from your college.
          </p>
        </motion.div>

        {/* Search and Filter Controls */}
        <motion.div 
          className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
          initial="hidden"
          animate="visible"
          variants={itemVariants}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search notices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-learnflow-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Category Filter */}
              <div className="relative">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-learnflow-500 appearance-none dark:bg-gray-700 dark:text-white"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </div>
              </div>

              {/* Sort By */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'priority')}
                  className="pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-learnflow-500 appearance-none dark:bg-gray-700 dark:text-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="priority">Priority</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Notices List */}
        <motion.div
          className="space-y-6"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {loading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse"
                variants={itemVariants}
              >
                <div className="p-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </motion.div>
            ))
          ) : error ? (
            // Error state
            <motion.div
              className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center"
              variants={itemVariants}
            >
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">
                {error}
              </h3>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-md hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          ) : filteredNotices.length === 0 ? (
            // No results
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center"
              variants={itemVariants}
            >
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                No notices found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery 
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "There are no notices available at the moment."}
              </p>
            </motion.div>
          ) : (
            // Notices list
            filteredNotices.map((notice) => (
              <motion.div
                key={notice.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
                variants={itemVariants}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {/* Category icon */}
                        <div className="mr-2">
                          {categories.find(cat => cat.id === notice.category)?.icon || <Info className="w-5 h-5 text-gray-500" />}
                        </div>
                        
                        {/* Title */}
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                          {notice.title}
                        </h2>
                      </div>
                      
                      {/* Meta information */}
                      <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 mb-3 gap-3">
                        {/* Date */}
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{formatDate(notice.created_at)}</span>
                        </div>
                        
                        {/* Category */}
                        <div className="flex items-center">
                          <Tag className="w-4 h-4 mr-1" />
                          <span className="capitalize">{notice.category}</span>
                        </div>
                        
                        {/* Priority badge */}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getPriorityColor(notice.priority)}`}>
                          {notice.priority} priority
                        </span>
                      </div>
                    </div>
                    
                    {/* Expand/collapse button */}
                    <button
                      onClick={() => toggleNotice(notice.id)}
                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      aria-label={expandedNotice === notice.id ? "Collapse notice" : "Expand notice"}
                    >
                      {expandedNotice === notice.id ? (
                        <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                  </div>
                  
                  {/* Preview content (always visible) */}
                  <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                    {notice.content}
                  </p>
                  
                  {/* Expanded content */}
                  <AnimatePresence>
                    {expandedNotice === notice.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          {/* Full content */}
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {notice.content}
                          </p>
                          
                          {/* Tags */}
                          {notice.tags && notice.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {notice.tags.map((tag, index) => (
                                <span 
                                  key={index}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {/* Additional information */}
                          <div className="flex flex-wrap gap-4 text-sm">
                            {/* Expiry date if available */}
                            {notice.expiry_date && (
                              <div className="flex items-center text-gray-500 dark:text-gray-400">
                                <Calendar className="w-4 h-4 mr-1" />
                                <span>Valid until: {formatDate(notice.expiry_date)}</span>
                              </div>
                            )}
                            
                            {/* Attachment if available */}
                            {notice.attachment_url && (
                              <a
                                href={notice.attachment_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-learnflow-600 dark:text-learnflow-400 hover:underline"
                              >
                                <FileText className="w-4 h-4 mr-1" />
                                <span>View attachment</span>
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </a>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default NoticesPage;