import React, { useState } from 'react';

const HelpPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('getting-started');
  
  const helpCategories = [
    { id: 'getting-started', name: 'Getting Started' },
    { id: 'account', name: 'Account Management' },
    { id: 'resources', name: 'Academic Resources' },
    { id: 'uploads', name: 'Uploading Files' },
    { id: 'tools', name: 'Student Tools' },
    { id: 'troubleshooting', name: 'Troubleshooting' },
  ];
  
  const faqItems = {
    'getting-started': [
      {
        question: 'What is LearnFlow?',
        answer: 'LearnFlow is an educational platform designed to help engineering students access academic resources, manage their coursework, and connect with peers. It provides tools for studying, organizing materials, and sharing knowledge.'
      },
      {
        question: 'How do I get started with LearnFlow?',
        answer: 'To get started, simply create an account by clicking the "Sign in with Google" button on the homepage. Once logged in, you can explore academic resources, use student tools, and customize your profile.'
      },
      {
        question: 'Is LearnFlow free to use?',
        answer: 'Yes, LearnFlow is completely free for all students. We believe in making education accessible to everyone.'
      }
    ],
    'account': [
      {
        question: 'How do I create an account?',
        answer: 'You can create an account by clicking the "Sign in with Google" button and authorizing with your Google account. This provides a secure and quick way to access LearnFlow.'
      },
      {
        question: 'How do I update my profile information?',
        answer: 'After logging in, click on your profile picture in the top right corner and select "Profile" from the dropdown menu. On your profile page, you can edit your personal information, change your profile picture, and manage your uploaded files.'
      },
      {
        question: 'Can I delete my account?',
        answer: 'Currently, account deletion must be requested manually. Please contact our support team at support@learnflow.edu with the subject "Account Deletion Request" and we will process your request within 48 hours.'
      }
    ],
    'resources': [
      {
        question: 'What academic resources are available?',
        answer: 'LearnFlow provides access to syllabi, assignments, practical guides, lab work materials, previous year question papers (PYQs), and lecture notes for various engineering courses and branches.'
      },
      {
        question: 'How are resources organized?',
        answer: 'Resources are organized by branch, year, semester, and subject. You can navigate through these categories to find the specific materials you need for your courses.'
      },
      {
        question: 'Can I contribute my own resources?',
        answer: 'Yes! We encourage students to share their knowledge. You can upload your own study materials through your profile page, which will be available to other students after a brief review process.'
      }
    ],
    'uploads': [
      {
        question: 'What types of files can I upload?',
        answer: 'You can upload PDF documents, Word files, PowerPoint presentations, images, and other common file formats related to your academic work.'
      },
      {
        question: 'Is there a file size limit?',
        answer: 'Yes, individual files are limited to 10MB. If you need to upload larger files, please consider splitting them into smaller parts or compressing them.'
      },
      {
        question: 'How do I organize my uploaded files?',
        answer: 'When uploading files, you can categorize them as Syllabus, Assignments, Practicals, Lab Work, PYQs, or Notes. This helps keep your uploads organized and makes them easier for others to find.'
      }
    ],
    'tools': [
      {
        question: 'What student tools are available?',
        answer: 'LearnFlow offers various tools including a GPA calculator, study timer, note-taking app, citation generator, and more to help with your academic work.'
      },
      {
        question: 'Are the tools available offline?',
        answer: 'Most tools require an internet connection, but we\'re working on making some features available offline in future updates.'
      },
      {
        question: 'How do I suggest a new tool?',
        answer: 'We welcome suggestions! Click on your profile picture and select "Feedback" to submit your ideas for new tools or improvements to existing ones.'
      }
    ],
    'troubleshooting': [
      {
        question: 'I can\'t log in to my account',
        answer: 'If you\'re having trouble logging in, try clearing your browser cache and cookies, or try using a different browser. If the problem persists, contact our support team.'
      },
      {
        question: 'My uploads are not appearing',
        answer: 'Uploads may take a few minutes to process. If your files don\'t appear after 15 minutes, check that they meet our file type and size requirements, then try uploading again.'
      },
      {
        question: 'The website is loading slowly',
        answer: 'This could be due to your internet connection or high traffic on our servers. Try refreshing the page or accessing the site during off-peak hours.'
      }
    ]
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Help Center</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Categories Sidebar */}
          <div className="md:w-1/4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Categories</h2>
              <nav className="space-y-1">
                {helpCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      activeCategory === category.id
                        ? 'bg-learnflow-100 text-learnflow-700 dark:bg-gray-700 dark:text-learnflow-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>
          
          {/* FAQ Content */}
          <div className="md:w-3/4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">
                {helpCategories.find(c => c.id === activeCategory)?.name} FAQ
              </h2>
              
              <div className="space-y-6">
                {faqItems[activeCategory as keyof typeof faqItems].map((item, index) => (
                  <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                    <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-white">
                      {item.question}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-white">
                  Still need help?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  If you couldn't find the answer to your question, feel free to contact our support team.
                </p>
                <a 
                  href="mailto:support@learnflow.edu"
                  className="inline-flex items-center px-4 py-2 bg-learnflow-500 text-white rounded-md hover:bg-learnflow-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;