/**
 * Educational utilities for the LearnFlow chatbot
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load website navigation data
let websiteNavigation = {};
try {
  const navigationPath = path.join(__dirname, '../data/websiteNavigation.json');
  const navigationData = fs.readFileSync(navigationPath, 'utf8');
  websiteNavigation = JSON.parse(navigationData);
  console.log('Loaded website navigation data');
} catch (error) {
  console.error('Error loading website navigation data:', error);
  websiteNavigation = { pages: [], departments: [], semesters: [], resources: [] };
}

// Course information database (simplified example)
export const courseDatabase = {
  'CHB101': {
    name: 'Chemistry Basics 101',
    description: 'Introduction to basic chemistry concepts including atoms, molecules, and chemical reactions.',
    topics: [
      'Atomic Structure',
      'Periodic Table',
      'Chemical Bonding',
      'Stoichiometry',
      'Nanomaterials',
      'Chemical Reactions'
    ],
    resources: [
      { name: 'Lecture Notes', path: '/resources/chb101/lectures' },
      { name: 'Lab Manuals', path: '/resources/chb101/labs' },
      { name: 'Practice Problems', path: '/resources/chb101/practice' }
    ]
  },
  'ITC101': {
    name: 'Introduction to Computing 101',
    description: 'Fundamentals of computer science and programming.',
    topics: [
      'Computer Architecture',
      'Binary and Hexadecimal',
      'Algorithms',
      'Programming Basics',
      'Data Structures',
      'Problem Solving'
    ],
    resources: [
      { name: 'Lecture Notes', path: '/resources/itc101/lectures' },
      { name: 'Programming Exercises', path: '/resources/itc101/exercises' },
      { name: 'Reference Materials', path: '/resources/itc101/references' }
    ]
  },
  'CSE201': {
    name: 'Computer Science Engineering 201',
    description: 'Advanced topics in computer science and engineering.',
    topics: [
      'Object-Oriented Programming',
      'Database Systems',
      'Web Development',
      'Software Engineering',
      'Network Fundamentals',
      'IoT Basics'
    ],
    resources: [
      { name: 'Lecture Notes', path: '/resources/cse201/lectures' },
      { name: 'Project Materials', path: '/resources/cse201/projects' },
      { name: 'Reference Materials', path: '/resources/cse201/references' }
    ]
  }
};

// Semester resources mapping
export const semesterResources = {
  '1': {
    courses: ['CHB101', 'ITC101', 'MTH101', 'PHY101', 'ENG101'],
    path: '/resources/semester1'
  },
  '2': {
    courses: ['CHB102', 'ITC102', 'MTH102', 'PHY102', 'ENG102'],
    path: '/resources/semester2'
  },
  '3': {
    courses: ['CSE201', 'CSE202', 'MTH201', 'ECE201', 'HUM201'],
    path: '/resources/semester3'
  },
  '4': {
    courses: ['CSE203', 'CSE204', 'MTH202', 'ECE202', 'HUM202'],
    path: '/resources/semester4'
  }
};

// Common educational topics with brief descriptions
export const educationalTopics = {
  'programming': {
    languages: ['Python', 'Java', 'JavaScript', 'C++', 'C#'],
    concepts: ['Variables', 'Control Flow', 'Functions', 'Classes', 'Data Structures', 'Algorithms']
  },
  'mathematics': {
    branches: ['Calculus', 'Linear Algebra', 'Discrete Mathematics', 'Statistics', 'Probability'],
    concepts: ['Derivatives', 'Integrals', 'Matrices', 'Vectors', 'Combinatorics']
  },
  'physics': {
    branches: ['Mechanics', 'Electromagnetism', 'Thermodynamics', 'Quantum Physics', 'Relativity'],
    concepts: ['Forces', 'Energy', 'Fields', 'Waves', 'Particles']
  },
  'chemistry': {
    branches: ['Organic', 'Inorganic', 'Physical', 'Analytical', 'Biochemistry'],
    concepts: ['Atoms', 'Molecules', 'Reactions', 'Bonds', 'States of Matter']
  }
};

/**
 * Get information about a specific course
 * @param {string} courseCode - Course code (e.g., CHB101)
 * @returns {Object|null} - Course information or null if not found
 */
export function getCourseInfo(courseCode) {
  const normalizedCode = courseCode.toUpperCase();
  return courseDatabase[normalizedCode] || null;
}

/**
 * Get resources for a specific semester
 * @param {string|number} semester - Semester number (1-8)
 * @returns {Object|null} - Semester resources or null if not found
 */
export function getSemesterResources(semester) {
  const semNumber = String(semester);
  return semesterResources[semNumber] || null;
}

/**
 * Check if a query is related to course navigation
 * @param {string} query - User query
 * @returns {boolean} - Whether query is related to navigation
 */
export function isNavigationQuery(query) {
  const navigationKeywords = [
    'where', 'find', 'locate', 'show me', 'how to access', 
    'resources', 'materials', 'lectures', 'notes', 'semester'
  ];
  
  const lowercaseQuery = query.toLowerCase();
  return navigationKeywords.some(keyword => lowercaseQuery.includes(keyword));
}

/**
 * Check if a query is related to a specific course
 * @param {string} query - User query
 * @returns {string|null} - Course code if found, null otherwise
 */
export function extractCourseCode(query) {
  // Match common course code patterns like CSE101, CHB 201, etc.
  const courseCodeRegex = /\b([A-Za-z]{2,3})\s*(\d{3})\b/i;
  const match = query.match(courseCodeRegex);
  
  if (match) {
    const courseCode = `${match[1]}${match[2]}`.toUpperCase();
    return courseDatabase[courseCode] ? courseCode : null;
  }
  
  return null;
}

/**
 * Get website navigation information based on a query
 * @param {string} query - User query
 * @returns {string} - Navigation information
 */
export function getWebsiteNavigationInfo(query) {
  const lowercaseQuery = query.toLowerCase();
  let navigationInfo = '';
  
  // Check for page-related queries
  if (websiteNavigation.pages) {
    for (const page of websiteNavigation.pages) {
      if (lowercaseQuery.includes(page.name.toLowerCase())) {
        navigationInfo += `\nThe ${page.name} page can be found at ${page.path}. ${page.description}\n`;
      }
    }
  }
  
  // Check for department-related queries
  if (websiteNavigation.departments) {
    for (const dept of websiteNavigation.departments) {
      if (lowercaseQuery.includes(dept.code.toLowerCase()) || 
          lowercaseQuery.includes(dept.name.toLowerCase())) {
        navigationInfo += `\nThe ${dept.name} (${dept.code}) department page can be found at ${dept.path}. It offers courses: ${dept.courses.join(', ')}.\n`;
      }
    }
  }
  
  // Check for semester-related queries
  if (websiteNavigation.semesters) {
    for (const sem of websiteNavigation.semesters) {
      const semRegex = new RegExp(`\\b${sem.number}(st|nd|rd|th)?\\s+sem(ester)?\\b`, 'i');
      if (semRegex.test(lowercaseQuery)) {
        navigationInfo += `\nThe ${sem.name} page can be found at ${sem.path}. It includes courses: ${sem.courses.join(', ')}.\n`;
      }
    }
  }
  
  // Check for resource-related queries
  if (websiteNavigation.resources) {
    for (const resource of websiteNavigation.resources) {
      if (lowercaseQuery.includes(resource.name.toLowerCase())) {
        navigationInfo += `\nThe ${resource.name} can be found at ${resource.path}. ${resource.description}\n`;
      }
    }
  }
  
  return navigationInfo;
}