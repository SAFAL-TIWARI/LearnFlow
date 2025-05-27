export interface PeopleAlsoAskItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  relatedLinks?: {
    text: string;
    url: string;
  }[];
}

export const peopleAlsoAskData: PeopleAlsoAskItem[] = [
  {
    id: 'what-is-cgpa',
    question: 'What is CGPA and how is it calculated?',
    answer: 'CGPA (Cumulative Grade Point Average) is the average of all your semester GPAs. It\'s calculated by taking the sum of all grade points earned divided by the total credit hours attempted. Most Indian universities use a 10-point scale where 10 is the highest grade.',
    category: 'Academic',
    relatedLinks: [
      { text: 'CGPA Calculator', url: '/tools/cgpa-calculator' },
      { text: 'GPA to Percentage Converter', url: '/tools/gpa-converter' }
    ]
  },
  {
    id: 'study-techniques',
    question: 'What are the best study techniques for engineering students?',
    answer: 'Effective study techniques for engineering include: 1) Pomodoro Technique for focused study sessions, 2) Active recall and spaced repetition, 3) Practice problems and past papers, 4) Group study for complex topics, 5) Creating visual aids like flowcharts and diagrams.',
    category: 'Study Tips',
    relatedLinks: [
      { text: 'Study Timer', url: '/tools/study-timer' },
      { text: 'Note Organizer', url: '/tools/note-organizer' }
    ]
  },
  {
    id: 'academic-resources',
    question: 'Where can I find quality academic resources for engineering?',
    answer: 'LearnFlow provides comprehensive academic resources including lecture notes, previous year papers, reference books, and study materials organized by year, semester, and branch. All resources are curated and verified for quality.',
    category: 'Resources',
    relatedLinks: [
      { text: 'Browse Resources', url: '/resources' },
      { text: 'Upload Resources', url: '/resources/upload' }
    ]
  },
  {
    id: 'time-management',
    question: 'How can I manage time effectively during exams?',
    answer: 'Effective exam time management includes: 1) Creating a study schedule 2-3 weeks before exams, 2) Using time-blocking techniques, 3) Prioritizing subjects based on difficulty and weightage, 4) Taking regular breaks, 5) Using tools like exam schedulers and study timers.',
    category: 'Exam Preparation',
    relatedLinks: [
      { text: 'Exam Scheduler', url: '/tools/exam-scheduler' },
      { text: 'Study Timer', url: '/tools/study-timer' }
    ]
  },
  {
    id: 'engineering-tools',
    question: 'What tools do engineering students need for academic success?',
    answer: 'Essential tools for engineering students include: CGPA calculators, study timers, note organizers, exam schedulers, unit converters, and access to academic resources. Digital tools help streamline studying and improve productivity.',
    category: 'Tools',
    relatedLinks: [
      { text: 'All Tools', url: '/tools' },
      { text: 'Quick Tools', url: '/tools/quick' }
    ]
  },
  {
    id: 'semester-planning',
    question: 'How should I plan my semester for better academic performance?',
    answer: 'Effective semester planning involves: 1) Understanding your course syllabus early, 2) Setting SMART academic goals, 3) Creating a study schedule with regular review sessions, 4) Tracking your progress using CGPA calculators, 5) Maintaining a balance between studies and extracurricular activities.',
    category: 'Academic Planning',
    relatedLinks: [
      { text: 'Academic Resources', url: '/resources' },
      { text: 'Study Planner', url: '/tools/study-planner' }
    ]
  }
];
