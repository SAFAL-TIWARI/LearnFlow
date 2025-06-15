import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import BlurTextAnimation from '../components/BlurTextAnimation';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import BackButton from '../components/BackButton';

// Icons
import {
  BookOpen,
  User,
  FileText,
  Upload,
  Wrench,
  AlertTriangle,
  HelpCircle,
  Mail,
  ExternalLink,
  ChevronDown,
  Search,
  ArrowRight,
  CheckCircle,
  Clock,
  Lock,
  Zap,
  Bookmark,
  Calendar,
  Calculator,
  // Tool
} from 'lucide-react';

const HelpPage: React.FC = () => {
  const { theme } = useTheme();
  const { user, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaqs, setExpandedFaqs] = useState<number[]>([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
    hidden: { y: 20, opacity: 0.7 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  const fadeInVariants = {
    hidden: { opacity: 0.6 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  // Help categories with icons
  const helpCategories = [
    { id: 'getting-started', name: 'Getting Started', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'technical-issues', name: 'Technical Issues', icon: <AlertTriangle className="w-5 h-5" /> },
    { id: 'academic-issues', name: 'Academic Issues', icon: <FileText className="w-5 h-5" /> },
    { id: 'administrative', name: 'Administrative', icon: <User className="w-5 h-5" /> },
    { id: 'resources', name: 'Academic Resources', icon: <Bookmark className="w-5 h-5" /> },
    { id: 'uploads', name: 'Uploading Files', icon: <Upload className="w-5 h-5" /> },
    { id: 'tools', name: 'Student Tools', icon: <Wrench className="w-5 h-5" /> },
  ];

  // FAQ items with enhanced content and links
  const faqItems = {
    'getting-started': [
      {
        question: 'What is LearnFlow?',
        answer: 'LearnFlow is an educational platform designed to help engineering students access academic resources, manage their coursework, and connect with peers. It provides tools for studying, organizing materials, and sharing knowledge.',
        icon: <HelpCircle className="w-5 h-5 text-learnflow-500" />
      },
      {
        question: 'How do I get started with LearnFlow?',
        answer: 'To get started, simply create an account by clicking the "Sign in with Google" button on the homepage. Once logged in, you can explore academic resources, use student tools, and customize your profile.',
        icon: <ArrowRight className="w-5 h-5 text-learnflow-500" />,
        link: '/signup',
        linkText: 'Create an account'
      },
      {
        question: 'Is LearnFlow free to use?',
        answer: 'Yes, LearnFlow is completely free for all students. We believe in making education accessible to everyone.',
        icon: <CheckCircle className="w-5 h-5 text-green-500" />
      },
      {
        question: 'How can I navigate the platform?',
        answer: 'The main navigation menu at the top of the page allows you to access different sections of LearnFlow. You can browse resources by branch and year, access student tools, view your profile, and more.',
        icon: <ExternalLink className="w-5 h-5 text-learnflow-500" />
      },
      {
        question: 'What devices can I use LearnFlow on?',
        answer: 'LearnFlow is fully responsive and works on desktops, laptops, tablets, and mobile phones. You can access all features from any device with a web browser.',
        icon: <Zap className="w-5 h-5 text-learnflow-500" />
      }
    ],
    'technical-issues': [
      {
        question: 'I can\'t log in to my account',
        answer: 'If you\'re having trouble logging in, try these steps:\n\n1. Clear your browser cache and cookies\n2. Try using a different browser\n3. Check if you\'re using the correct email address\n4. Reset your password using the "Forgot Password" link\n\nIf the problem persists, contact our support team.',
        icon: <Lock className="w-5 h-5 text-red-500" />,
        link: '/forgot-password',
        linkText: 'Reset your password'
      },
      {
        question: 'I\'ve forgotten my password',
        answer: 'If you\'ve forgotten your password, you can easily reset it by clicking the "Forgot Password" link on the login page. You\'ll receive an email with instructions to create a new password. Make sure to check your spam folder if you don\'t see the email in your inbox.',
        icon: <Lock className="w-5 h-5 text-orange-500" />,
        link: '/forgot-password',
        linkText: 'Reset your password'
      },
      {
        question: 'My account is locked after too many login attempts',
        answer: 'For security reasons, your account may be temporarily locked after multiple failed login attempts. Wait for 30 minutes before trying again. If you\'re still unable to access your account after waiting, use the "Forgot Password" feature to reset your credentials or contact our support team for assistance.',
        icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
        link: '/forgot-password',
        linkText: 'Reset your password'
      },
      {
        question: 'I\'m not receiving the verification email',
        answer: 'If you haven\'t received your verification email:\n\n1. Check your spam or junk folder\n2. Verify you entered the correct email address\n3. Add support@learnflow.edu to your contacts\n4. Wait a few minutes as emails can sometimes be delayed\n\nYou can request another verification email from the login page. If you still don\'t receive it, contact our support team.',
        icon: <Mail className="w-5 h-5 text-blue-500" />,
        link: 'mailto:support@learnflow.edu?subject=Verification%20Email%20Issue',
        linkText: 'Contact support'
      },
      {
        question: 'I\'m having trouble with Google Sign-In',
        answer: 'If you\'re experiencing issues with Google Sign-In:\n\n1. Ensure you\'re using a supported browser (Chrome, Firefox, Safari, Edge)\n2. Clear your browser cookies and cache\n3. Make sure you\'re using the correct Google account\n4. Check if third-party cookies are enabled in your browser\n5. Try signing out of all Google accounts and then sign in again\n\nIf problems persist, try the email/password login method instead.',
        icon: <User className="w-5 h-5 text-purple-500" />
      },
      {
        question: 'I keep getting redirected after login',
        answer: 'If you\'re being redirected unexpectedly after logging in:\n\n1. Check if you have any browser extensions that might interfere with redirects\n2. Clear your browser cache and cookies\n3. Try using incognito/private browsing mode\n4. Ensure your browser is updated to the latest version\n\nThis issue is often caused by cached data or session conflicts. If the problem continues, please contact our support team with details about your browser and device.',
        icon: <ArrowRight className="w-5 h-5 text-yellow-500" />,
        link: 'mailto:support@learnflow.edu?subject=Login%20Redirect%20Issue',
        linkText: 'Report redirect issue'
      },
      {
        question: 'The website is loading slowly',
        answer: 'This could be due to your internet connection or high traffic on our servers. Try refreshing the page or accessing the site during off-peak hours. You can also try clearing your browser cache or using a different browser.',
        icon: <Clock className="w-5 h-5 text-yellow-500" />
      },
      {
        question: 'I\'m experiencing display issues or broken elements',
        answer: 'If certain elements of the website aren\'t displaying correctly:\n\n1. Try refreshing the page\n2. Clear your browser cache\n3. Update your browser to the latest version\n4. Try a different browser\n\nIf the issue persists, please report it to our support team with details about your device and browser.',
        icon: <AlertTriangle className="w-5 h-5 text-orange-500" />
      },
      {
        question: 'The search function isn\'t working properly',
        answer: 'If you\'re having trouble with the search function, try using more specific keywords or check for any typos. Our search works best with precise terms related to subjects, topics, or file types. If the issue continues, try clearing your browser cache or report it to our support team.',
        icon: <Search className="w-5 h-5 text-blue-500" />
      },
      {
        question: 'I can\'t download files',
        answer: 'If you\'re unable to download files, check your browser\'s download settings and ensure you have sufficient storage space. Some browsers might block downloads by default. Try using a different browser or adjusting your browser settings. For large files, ensure you have a stable internet connection.',
        icon: <FileText className="w-5 h-5 text-purple-500" />
      }
    ],
    'academic-issues': [
      {
        question: 'I can\'t find materials for my course',
        answer: 'If you can\'t find materials for your specific course, try these steps:\n\n1. Check different categories (notes, assignments, PYQs)\n2. Try different search terms\n3. Look under related subjects\n4. Check if you\'ve selected the correct branch and year\n\nIf materials are still missing, you can contribute by uploading them yourself or request them through the feedback form.',
        icon: <BookOpen className="w-5 h-5 text-blue-500" />,
        link: '/resources',
        linkText: 'Browse all resources'
      },
      {
        question: 'The study materials seem outdated',
        answer: 'We strive to keep all materials up-to-date, but some content may reflect previous academic years. Check the upload date on materials to verify their recency. If you have access to more current materials, please consider uploading them to help your fellow students.',
        icon: <Clock className="w-5 h-5 text-yellow-500" />,
        link: '/upload',
        linkText: 'Upload updated materials'
      },
      {
        question: 'How do I track my academic progress?',
        answer: 'You can use our CGPA Calculator tool to track your academic progress. Input your course grades and credits to calculate your current CGPA. The tool also allows you to simulate future scenarios to set academic goals.',
        icon: <Calculator className="w-5 h-5 text-green-500" />,
        link: '/tools/cgpa-calculator',
        linkText: 'Use CGPA Calculator'
      },
      {
        question: 'How can I prepare for upcoming exams?',
        answer: 'LearnFlow offers several resources to help you prepare for exams:\n\n1. Previous Year Question Papers (PYQs)\n2. Study notes from top-performing students\n3. Practice assignments\n4. The Exam Scheduler tool to plan your study time\n\nYou can find these resources by navigating to your branch and year section.',
        icon: <FileText className="w-5 h-5 text-purple-500" />,
        link: '/tools/exam-scheduler',
        linkText: 'Use Exam Scheduler'
      },
      {
        question: 'I need help understanding a difficult topic',
        answer: 'If you\'re struggling with a particular topic, try looking for detailed notes or practical guides in the resources section. You can also use the feedback form to request additional materials on specific topics. In future updates, we plan to add a community forum where you can ask questions directly to other students.',
        icon: <HelpCircle className="w-5 h-5 text-red-500" />,
        link: '/feedback',
        linkText: 'Request help with a topic'
      }
    ],
    'administrative': [
      {
        question: 'How do I update my profile information?',
        answer: 'After logging in, click on your profile picture in the top right corner and select "Profile" from the dropdown menu. On your profile page, you can edit your personal information, change your profile picture, and manage your uploaded files.',
        icon: <User className="w-5 h-5 text-blue-500" />,
        link: '/profile',
        linkText: 'Go to your profile'
      },
      {
        question: 'How do I change my branch or year?',
        answer: 'You can update your academic information from your profile page. Click on "Edit Profile" and select your current branch and year from the dropdown menus. This helps us show you the most relevant resources for your courses.',
        icon: <ArrowRight className="w-5 h-5 text-green-500" />,
        link: '/profile',
        linkText: 'Update your information'
      },
      {
        question: 'Can I delete my account?',
        answer: 'You can permanently delete your LearnFlow account at any time. This action will remove all your data including your profile, uploaded files, and account information. This action cannot be undone.',
        icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
        hasDeleteButton: true
      },
      {
        question: 'How do I report inappropriate content?',
        answer: 'If you come across any content that violates our community guidelines, please report it immediately. Click the "Report" button next to the content or contact our support team with details about the material in question. We take all reports seriously and will review them promptly.',
        icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
        link: 'mailto:support@learnflow.edu?subject=Content%20Report',
        linkText: 'Report content'
      },
      {
        question: 'How can I provide feedback about LearnFlow?',
        answer: 'We value your feedback! Click on your profile picture and select "Feedback" from the dropdown menu. You can share your thoughts, suggestions, and report any issues you\'ve encountered. Your input helps us improve the platform for everyone.',
        icon: <Mail className="w-5 h-5 text-purple-500" />,
        link: '/feedback',
        linkText: 'Submit feedback'
      }
    ],
    'resources': [
      {
        question: 'What academic resources are available?',
        answer: 'LearnFlow provides access to a wide range of academic resources including:\n\n• Syllabi for all courses\n• Assignments and solutions\n• Practical guides and lab manuals\n• Previous Year Question Papers (PYQs)\n• Comprehensive lecture notes\n• Reference materials and textbook recommendations',
        icon: <BookOpen className="w-5 h-5 text-blue-500" />,
        link: '/resources',
        linkText: 'Browse resources'
      },
      {
        question: 'How are resources organized?',
        answer: 'Resources are organized hierarchically by:\n\n1. Branch (e.g., Computer Science, Electrical Engineering)\n2. Year of study (1st year to final year)\n3. Semester (Odd/Even)\n4. Subject\n5. Type of material (Notes, Assignments, PYQs, etc.)\n\nThis structure makes it easy to find exactly what you need for your courses.',
        icon: <FileText className="w-5 h-5 text-green-500" />
      },
      {
        question: 'Can I contribute my own resources?',
        answer: 'Yes! We encourage students to share their knowledge. You can upload your own study materials through the upload page. All contributions are reviewed to ensure quality before being made available to other students. Sharing your notes and materials helps build our community knowledge base.',
        icon: <Upload className="w-5 h-5 text-purple-500" />,
        link: '/upload',
        linkText: 'Upload materials'
      },
      {
        question: 'How do I find resources for a specific subject?',
        answer: 'You can find subject-specific resources in two ways:\n\n1. Navigate through the branch > year > semester > subject hierarchy\n2. Use the search function at the top of the page to directly search for the subject name\n\nThe search function also allows you to filter by resource type (notes, assignments, etc.).',
        icon: <Search className="w-5 h-5 text-orange-500" />
      },
      {
        question: 'Are the resources verified for accuracy?',
        answer: 'All uploaded resources undergo a review process before being published. However, we recommend cross-referencing information with your course materials and textbooks. If you find any inaccuracies, please report them using the feedback form so we can improve our content quality.',
        icon: <CheckCircle className="w-5 h-5 text-yellow-500" />,
        link: '/feedback',
        linkText: 'Report inaccuracies'
      }
    ],
    'uploads': [
      {
        question: 'What types of files can I upload?',
        answer: 'You can upload the following file types:\n\n• PDF documents (.pdf)\n• Word documents (.doc, .docx)\n• PowerPoint presentations (.ppt, .pptx)\n• Excel spreadsheets (.xls, .xlsx)\n• Images (.jpg, .png)\n• Text files (.txt)\n\nAll files should be related to academic content and comply with our community guidelines.',
        icon: <FileText className="w-5 h-5 text-blue-500" />
      },
      {
        question: 'Is there a file size limit?',
        answer: 'Yes, individual files are limited to 10MB. If you need to upload larger files, please consider splitting them into smaller parts or compressing them. For very large collections, you can create a zip file, but it must still be under the 10MB limit.',
        icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />
      },
      {
        question: 'How do I organize my uploaded files?',
        answer: 'When uploading files, you\'ll be prompted to categorize them by:\n\n• Branch\n• Year\n• Semester\n• Subject\n• Type (Syllabus, Assignments, Practicals, Lab Work, PYQs, or Notes)\n\nProviding accurate categorization helps other students find your contributions easily.',
        icon: <Bookmark className="w-5 h-5 text-green-500" />
      },
      {
        question: 'My uploads are not appearing',
        answer: 'Uploads may take a few minutes to process and undergo a brief review. If your files don\'t appear after 24 hours, check that they meet our file type and size requirements, then try uploading again. If the problem persists, contact our support team for assistance.',
        icon: <Clock className="w-5 h-5 text-orange-500" />
      },
      {
        question: 'Can I edit or delete my uploads?',
        answer: 'Yes, you can manage your uploads from your profile page. Navigate to the "My Uploads" section where you can view, edit details, or delete files you\'ve previously uploaded. Note that editing is limited to metadata (title, description, categories) and not the file content itself.',
        // icon: <Tool className="w-5 h-5 text-purple-500" />,
        link: '/profile',
        linkText: 'Manage your uploads'
      }
    ],
    'tools': [
      {
        question: 'What student tools are available?',
        answer: 'LearnFlow offers several tools to enhance your academic experience:\n\n• CGPA Calculator - Calculate your cumulative grade point average\n• Study Timer - Track and optimize your study sessions\n• Note Organizer - Keep your digital notes organized\n• Exam Scheduler - Plan your exam preparation efficiently\n\nAll tools are designed to help you manage your academic life more effectively.',
        icon: <Wrench className="w-5 h-5 text-blue-500" />,
        link: '/tools',
        linkText: 'Explore all tools'
      },
      {
        question: 'How do I use the CGPA Calculator?',
        answer: 'The CGPA Calculator allows you to input your course grades and credit hours to calculate your cumulative GPA. Simply enter the details for each course, and the tool will automatically calculate your GPA for the semester and update your cumulative GPA if you\'ve entered previous semesters.',
        icon: <Calculator className="w-5 h-5 text-green-500" />,
        link: '/tools/cgpa-calculator',
        linkText: 'Use CGPA Calculator'
      },
      {
        question: 'How does the Study Timer work?',
        answer: 'The Study Timer uses the Pomodoro Technique to help you study more effectively. It alternates between focused study periods (typically 25 minutes) and short breaks (5 minutes). After completing four study sessions, you get a longer break (15-30 minutes). This technique helps maintain concentration and prevent burnout.',
        icon: <Clock className="w-5 h-5 text-purple-500" />,
        link: '/tools/study-timer',
        linkText: 'Use Study Timer'
      },
      {
        question: 'How can I organize my notes?',
        answer: 'The Note Organizer tool allows you to create, categorize, and search through digital notes. You can organize notes by subject, add tags for easy searching, and even attach related files. The tool supports basic formatting to help structure your information effectively.',
        icon: <FileText className="w-5 h-5 text-orange-500" />,
        link: '/tools/note-organizer',
        linkText: 'Use Note Organizer'
      },
      {
        question: 'How do I plan my exam schedule?',
        answer: 'The Exam Scheduler helps you create a comprehensive study plan leading up to your exams. Enter your exam dates, assign priority levels to different subjects, and the tool will generate a balanced study schedule. You can adjust the plan as needed and set reminders for study sessions.',
        icon: <Calendar className="w-5 h-5 text-yellow-500" />,
        link: '/tools/exam-scheduler',
        linkText: 'Use Exam Scheduler'
      }
    ]
  };

  // Toggle FAQ expansion
  const toggleFaq = (index: number) => {
    setExpandedFaqs(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  // Filter FAQs based on search query
  const filteredFaqs = searchQuery.trim() === ''
    ? faqItems[activeCategory as keyof typeof faqItems]
    : Object.values(faqItems).flat().filter(item =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Focus search input
  const focusSearch = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!user) {
      alert('You must be logged in to delete your account.');
      return;
    }

    setIsDeleting(true);
    try {
      console.log('Starting account deletion process...');
      const { error } = await deleteAccount();
      if (error) {
        console.error('Error deleting account:', error);
        const errorMessage = error.message || 'Failed to delete account';
        alert(`Failed to delete account: ${errorMessage}. Please try again or contact support.`);
      } else {
        console.log('Account deleted successfully');
        alert('Your account has been successfully deleted.');
        navigate('/');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred. Please try again or contact support.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-1xl mx-auto">
        <div className="flex items-center mb-6">
          <BackButton />
        </div>
        <motion.div
          className="text-center mb-12"
          variants={itemVariants}
        >
          <BlurTextAnimation
            text="Student Help Center"
            className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4"
            speed={300}
          />
          <motion.p
            className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            variants={fadeInVariants}
          >
            Find answers to your questions and solutions to common problems
          </motion.p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          className="mb-10 relative"
          variants={itemVariants}
        >
          <div className="relative max-w-1xl mx-auto">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-4 pl-12 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-learnflow-500 transition-all"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>

          {/* Quick Help Buttons */}
          <motion.div
            className="flex flex-wrap justify-center gap-2 mt-4"
            variants={fadeInVariants}
          >
            <button
              onClick={() => {
                setSearchQuery('login');
                focusSearch();
              }}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Login Issues
            </button>
            <button
              onClick={() => {
                setSearchQuery('upload');
                focusSearch();
              }}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Upload Problems
            </button>
            <button
              onClick={() => {
                setSearchQuery('exam');
                focusSearch();
              }}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Exam Preparation
            </button>
            <button
              onClick={() => {
                setSearchQuery('resources');
                focusSearch();
              }}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Finding Resources
            </button>
          </motion.div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Categories Sidebar */}
          <motion.div
            className="lg:w-1/4"
            variants={itemVariants}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sticky top-20">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Help Categories</h2>
              <nav className="space-y-1">
                {helpCategories.map((category) => (
                  <motion.button
                    key={category.id}
                    onClick={() => {
                      setActiveCategory(category.id);
                      setSearchQuery('');
                    }}
                    className={`w-full text-left px-3 py-3 rounded-md transition-all flex items-center ${
                      activeCategory === category.id
                        ? 'bg-learnflow-100 text-learnflow-700 dark:bg-gray-700 dark:text-learnflow-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="mr-3">{category.icon}</span>
                    {category.name}
                  </motion.button>
                ))}
              </nav>

              {/* Help Resources */}
              <div className="mt-8 p-4 bg-learnflow-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-md font-medium mb-3 text-gray-800 dark:text-white">
                  Additional Resources
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link to="/terms-of-service" className="text-learnflow-600 dark:text-learnflow-400 hover:underline flex items-center">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link to="/privacy-policy" className="text-learnflow-600 dark:text-learnflow-400 hover:underline flex items-center">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link to="/feedback" className="text-learnflow-600 dark:text-learnflow-400 hover:underline flex items-center">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Submit Feedback
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* FAQ Content */}
          <motion.div
            className="lg:w-3/4"
            variants={itemVariants}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              {searchQuery.trim() === '' ? (
                <motion.h2
                  className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center"
                  variants={fadeInVariants}
                >
                  <span className="mr-3">
                    {helpCategories.find(c => c.id === activeCategory)?.icon}
                  </span>
                  {helpCategories.find(c => c.id === activeCategory)?.name}
                </motion.h2>
              ) : (
                <motion.h2
                  className="text-2xl font-bold mb-6 text-gray-800 dark:text-white"
                  variants={fadeInVariants}
                >
                  Search Results: "{searchQuery}"
                </motion.h2>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory + searchQuery}
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {filteredFaqs.length > 0 ? (
                    filteredFaqs.map((item, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() => toggleFaq(index)}
                          className="w-full text-left px-5 py-4 flex items-center justify-between bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          style={{ opacity: 1 }}
                        >
                          <div className="flex items-center" style={{ opacity: 1 }}>
                            <span className="mr-3" style={{ opacity: 1 }}>{item.icon}</span>
                            <h3
                              className="text-lg font-medium text-gray-800 dark:text-white"
                              style={{
                                opacity: 1,
                                visibility: 'visible',
                                display: 'block',
                                color: theme === 'dark' ? '#ffffff' : '#1f2937'
                              } as React.CSSProperties}
                            >
                              {item.question}
                            </h3>
                          </div>
                          <ChevronDown
                            className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${expandedFaqs.includes(index) ? 'transform rotate-180' : ''}`}
                            style={{ opacity: 1 }}
                          />
                        </button>

                        <AnimatePresence>
                          {expandedFaqs.includes(index) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="p-5 bg-white dark:bg-gray-800" style={{ opacity: 1 }}>
                                <p
                                  className="text-gray-600 dark:text-gray-300 whitespace-pre-line"
                                  style={{
                                    opacity: '1 !important',
                                    visibility: 'visible',
                                    display: 'block !important',
                                    color: theme === 'dark' ? '#d1d5db' : '#4b5563'
                                  }}
                                >
                                  {item.answer}
                                </p>

                                {item.link && (
                                  <motion.div
                                    className="mt-4"
                                    whileHover={{ x: 5 }}
                                  >
                                    {item.link.startsWith('mailto:') ? (
                                      <Link
                                        to={item.link}
                                        className="inline-flex items-center text-learnflow-600 dark:text-learnflow-400 hover:text-learnflow-700 dark:hover:text-learnflow-300"
                                      >
                                        {item.linkText}
                                        <ArrowRight className="ml-2 w-4 h-4" />
                                      </Link>
                                    ) : (
                                      item.link.includes('/signup') || 
                                      item.link.includes('/login') || 
                                      item.link.includes('/forgot-password') ? (
                                        <button
                                          onClick={() => {
                                            const mode = item.link.includes('/signup') ? 'signup' : 'signin';
                                            const width = 500;
                                            const height = 600;
                                            const left = window.screenX + (window.outerWidth - width) / 2;
                                            const top = window.screenY + (window.outerHeight - height) / 2;
                                            const loginWindow = window.open(
                                              `/login?mode=${mode}`, 
                                              '_blank', 
                                              `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
                                            );
                                            if (loginWindow) loginWindow.focus();
                                          }}
                                          className="inline-flex items-center text-learnflow-600 dark:text-learnflow-400 hover:text-learnflow-700 dark:hover:text-learnflow-300"
                                        >
                                          {item.linkText}
                                          <ExternalLink className="ml-2 w-4 h-4" />
                                        </button>
                                      ) : (
                                        <Link
                                          to={item.link}
                                          className="inline-flex items-center text-learnflow-600 dark:text-learnflow-400 hover:text-learnflow-700 dark:hover:text-learnflow-300"
                                        >
                                          {item.linkText}
                                          <ArrowRight className="ml-2 w-4 h-4" />
                                        </Link>
                                      )
                                    )}
                                  </motion.div>
                                )}

                                {/* Delete Account Button */}
                                {(item as any).hasDeleteButton && user && (
                                  <motion.div
                                    className="mt-4"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    <button
                                      onClick={() => setShowDeleteConfirmation(true)}
                                      className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-medium"
                                    >
                                      <AlertTriangle className="w-4 h-4 mr-2" />
                                      Delete My Account
                                    </button>
                                  </motion.div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))
                  ) : (
                    <motion.div
                      className="text-center py-10"
                      variants={fadeInVariants}
                    >
                      <HelpCircle className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                      <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">No results found</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        We couldn't find any help articles matching your search.
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Contact Support Section */}
              <motion.div
                className="mt-10 p-6 bg-gradient-to-r from-learnflow-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 rounded-lg border border-learnflow-100 dark:border-gray-600"
                variants={fadeInVariants}
              >
                <div className="flex flex-col md:flex-row items-center">
                  <div className="md:w-2/3">
                    <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
                      Still need help?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      If you couldn't find the answer to your question, our support team is ready to assist you.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <motion.a
                        href="mailto:support@learnflow.edu"
                        className="inline-flex items-center px-4 py-2 bg-learnflow-500 text-white rounded-md hover:bg-learnflow-600 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Mail className="w-5 h-5 mr-2" />
                        Email Support
                      </motion.a>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link
                          to="/feedback"
                          className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 text-learnflow-600 dark:text-learnflow-400 border border-learnflow-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <HelpCircle className="w-5 h-5 mr-2" />
                          Submit a Request
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                  <div className="md:w-1/3 mt-6 md:mt-0 flex justify-center">
                    <motion.div
                      animate={{
                        y: [0, -10, 0],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 3,
                        ease: "easeInOut"
                      }}
                    >
                      <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-learnflow-500 dark:text-learnflow-400">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 10.5H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 14H13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Quick Links Section */}
              <motion.div
                className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4"
                variants={containerVariants}
              >
                <motion.div
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                >
                  <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-white flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-learnflow-500" />
                    Academic Resources
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    Access study materials, notes, and past papers
                  </p>
                  <Link
                    to="/resources"
                    className="text-learnflow-600 dark:text-learnflow-400 text-sm flex items-center hover:underline"
                  >
                    Browse resources <ArrowRight className="ml-1 w-4 h-4" />
                  </Link>
                </motion.div>

                <motion.div
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                >
                  <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-white flex items-center">
                    <Wrench className="w-5 h-5 mr-2 text-learnflow-500" />
                    Student Tools
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    Use our CGPA calculator, study timer, and more
                  </p>
                  <Link
                    to="/tools"
                    className="text-learnflow-600 dark:text-learnflow-400 text-sm flex items-center hover:underline"
                  >
                    Explore tools <ArrowRight className="ml-1 w-4 h-4" />
                  </Link>
                </motion.div>

                <motion.div
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                >
                  <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-white flex items-center">
                    <Upload className="w-5 h-5 mr-2 text-learnflow-500" />
                    Upload Materials
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    Share your notes and resources with other students
                  </p>
                  <Link
                    to="/upload"
                    className="text-learnflow-600 dark:text-learnflow-400 text-sm flex items-center hover:underline"
                  >
                    Upload now <ArrowRight className="ml-1 w-4 h-4" />
                  </Link>
                </motion.div>

                <motion.div
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                >
                  <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-white flex items-center">
                    <User className="w-5 h-5 mr-2 text-learnflow-500" />
                    Account Settings
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    Manage your profile and preferences
                  </p>
                  <Link
                    to="/profile"
                    className="text-learnflow-600 dark:text-learnflow-400 text-sm flex items-center hover:underline"
                  >
                    Go to profile <ArrowRight className="ml-1 w-4 h-4" />
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirmation && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteConfirmation(false)}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete Account
                </h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to permanently delete your account? This action cannot be undone and will remove:
              </p>
              
              <ul className="text-sm text-gray-600 dark:text-gray-300 mb-6 space-y-1">
                <li>• Your profile and personal information</li>
                <li>• All uploaded files and resources</li>
                <li>• Your account history and preferences</li>
                <li>• Access to all LearnFlow services</li>
              </ul>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowDeleteConfirmation(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isDeleting ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Deleting...
                    </>
                  ) : (
                    'Delete Account'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HelpPage;