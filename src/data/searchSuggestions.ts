export interface SearchSuggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  visitCount: number;
  icon: string;
  link: string;
}

export const searchSuggestions: SearchSuggestion[] = [
  {
    id: 'cgpa-calculator',
    title: 'CGPA Calculator',
    description: 'Calculate your CGPA from semester grades and marks',
    category: 'Academic Tools',
    visitCount: 15420,
    icon: '🧮',
    link: '/tools/cgpa-calculator'
  },
  {
    id: 'study-timer',
    title: 'Study Timer & Pomodoro',
    description: 'Focus timer with break reminders for productive study sessions',
    category: 'Productivity Tools',
    visitCount: 12850,
    icon: '⏰',
    link: '/tools/study-timer'
  },
  {
    id: 'academic-resources',
    title: 'Academic Resources',
    description: 'Access notes, papers, and study materials by branch and semester',
    category: 'Resources',
    visitCount: 11200,
    icon: '📚',
    link: '/resources'
  },
  {
    id: 'exam-scheduler',
    title: 'Exam Scheduler',
    description: 'Plan and organize your exam timetable with reminders',
    category: 'Academic Tools',
    visitCount: 9800,
    icon: '📅',
    link: '/tools/exam-scheduler'
  },
  {
    id: 'note-organizer',
    title: 'Note Organizer',
    description: 'Organize and manage your study notes efficiently',
    category: 'Productivity Tools',
    visitCount: 8650,
    icon: '📝',
    link: '/tools/note-organizer'
  },
  {
    id: 'gpa-converter',
    title: 'GPA to Percentage Converter',
    description: 'Convert CGPA to percentage and vice versa',
    category: 'Academic Tools',
    visitCount: 7900,
    icon: '🔄',
    link: '/tools/gpa-converter'
  },
  {
    id: 'unit-converter',
    title: 'Unit Converter',
    description: 'Convert between different units for engineering calculations',
    category: 'Engineering Tools',
    visitCount: 6750,
    icon: '⚖️',
    link: '/tools/unit-converter'
  },
  {
    id: 'quick-tools',
    title: 'Quick Tools',
    description: 'Access frequently used calculators and converters',
    category: 'Productivity Tools',
    visitCount: 5800,
    icon: '⚡',
    link: '/tools/quick'
  },
  {
    id: 'study-planner',
    title: 'Study Planner',
    description: 'Plan your study schedule and track progress',
    category: 'Academic Tools',
    visitCount: 5200,
    icon: '📋',
    link: '/tools/study-planner'
  }
];

// Sort suggestions by visit count (most visited first)
export const getSortedSuggestions = () => {
  return [...searchSuggestions].sort((a, b) => b.visitCount - a.visitCount);
};

export const getTopSuggestions = (count: number = 5) => {
  return getSortedSuggestions().slice(0, count);
};
