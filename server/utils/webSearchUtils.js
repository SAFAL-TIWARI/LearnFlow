/**
 * Web Search Utilities for the LearnFlow chatbot
 * This module helps the chatbot search the web for information
 */

import fetch from 'node-fetch';

// Google Search API key (replace with your actual key if you have one)
const GOOGLE_SEARCH_API_KEY = process.env.GOOGLE_SEARCH_API_KEY ;
const GOOGLE_SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID || '017576662512468239146:omuauf_lfve';

/**
 * Determine if a query likely needs web search
 * @param {string} query - User query
 * @returns {boolean} - Whether the query likely needs web search
 */
export function needsWebSearch(query) {
  // Normalize query
  const normalizedQuery = query.toLowerCase();
  
  // Keywords that suggest current events or recent information
  const currentEventKeywords = [
    'latest', 'recent', 'new', 'current', 'today', 'yesterday', 'this week', 'this month',
    'this year', 'update', 'news', '2023', '2024', '2025'
  ];
  
  // Check if query contains any current event keywords
  const containsCurrentEventKeyword = currentEventKeywords.some(keyword => 
    normalizedQuery.includes(keyword)
  );
  
  // Check if query is asking about something that might need web search
  const isAskingAboutExternalTopic = 
    !normalizedQuery.includes('learnflow') && 
    !normalizedQuery.includes('course') &&
    !normalizedQuery.includes('assignment') &&
    !normalizedQuery.includes('lecture') &&
    !normalizedQuery.includes('professor') &&
    !normalizedQuery.includes('class');
  
  return containsCurrentEventKeyword || isAskingAboutExternalTopic;
}

/**
 * Perform a web search for a query
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Search results
 */
export async function performWebSearch(query) {
  try {
    // If we don't have a real Google Search API key, simulate search results
    if (!process.env.GOOGLE_SEARCH_API_KEY) {
      console.log('Using simulated web search results (no API key provided)');
      return simulateWebSearchResults(query);
    }
    
    // Construct the Google Search API URL
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_SEARCH_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}`;
    
    // Make the request
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    // Check if the response contains items
    if (data.items && data.items.length > 0) {
      // Return the top 3 results
      return data.items.slice(0, 3).map(item => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet
      }));
    } else {
      console.log('No search results found');
      return [];
    }
  } catch (error) {
    console.error('Error performing web search:', error);
    return simulateWebSearchResults(query);
  }
}

/**
 * Simulate web search results when no API key is available
 * @param {string} query - Search query
 * @returns {Array} - Simulated search results
 */
function simulateWebSearchResults(query) {
  // Normalize query
  const normalizedQuery = query.toLowerCase();
  
  // Check for common educational topics
  if (normalizedQuery.includes('python') || normalizedQuery.includes('programming')) {
    return [
      {
        title: 'Python Documentation',
        link: 'https://docs.python.org/3/',
        snippet: 'Official Python documentation with tutorials, library references, and more.'
      },
      {
        title: 'W3Schools Python Tutorial',
        link: 'https://www.w3schools.com/python/',
        snippet: 'Python tutorial with examples and exercises for beginners and advanced learners.'
      },
      {
        title: 'Real Python - Python Tutorials',
        link: 'https://realpython.com/',
        snippet: 'Python tutorials for developers of all skill levels, with in-depth articles and practical examples.'
      }
    ];
  } else if (normalizedQuery.includes('math') || normalizedQuery.includes('calculus')) {
    return [
      {
        title: 'Khan Academy - Mathematics',
        link: 'https://www.khanacademy.org/math',
        snippet: 'Free online courses, lessons & practice in math, including arithmetic, algebra, geometry, and calculus.'
      },
      {
        title: 'MIT OpenCourseWare - Mathematics',
        link: 'https://ocw.mit.edu/courses/mathematics/',
        snippet: 'Free lecture notes, exams, and videos from MIT mathematics courses.'
      },
      {
        title: 'Paul\'s Online Math Notes',
        link: 'https://tutorial.math.lamar.edu/',
        snippet: 'Free and complete set of online notes for Algebra, Calculus, and Differential Equations.'
      }
    ];
  } else if (normalizedQuery.includes('physics') || normalizedQuery.includes('science')) {
    return [
      {
        title: 'Physics Classroom',
        link: 'https://www.physicsclassroom.com/',
        snippet: 'Online physics tutorials and interactive activities for students and teachers.'
      },
      {
        title: 'Khan Academy - Physics',
        link: 'https://www.khanacademy.org/science/physics',
        snippet: 'Free online courses, lessons & practice in physics, including mechanics, electricity, and more.'
      },
      {
        title: 'HyperPhysics',
        link: 'http://hyperphysics.phy-astr.gsu.edu/hbase/index.html',
        snippet: 'Comprehensive physics reference with concepts organized in a hierarchical structure.'
      }
    ];
  } else {
    // Generic educational resources
    return [
      {
        title: 'Khan Academy',
        link: 'https://www.khanacademy.org/',
        snippet: 'Free online courses, lessons & practice in math, science, and more for students of all ages.'
      },
      {
        title: 'Coursera',
        link: 'https://www.coursera.org/',
        snippet: 'Online courses from top universities and companies in various subjects.'
      },
      {
        title: 'edX',
        link: 'https://www.edx.org/',
        snippet: 'Free online courses from Harvard, MIT, and more in computer science, business, and other subjects.'
      }
    ];
  }
}

/**
 * Format web search results for inclusion in the chatbot response
 * @param {Array} results - Search results
 * @returns {string} - Formatted search results
 */
export function formatWebSearchResults(results) {
  if (!results || results.length === 0) {
    return '';
  }
  
  let formattedResults = '\n\nHere are some resources that might help:\n\n';
  
  results.forEach((result, index) => {
    formattedResults += `${index + 1}. [${result.title}](${result.link})\n   ${result.snippet}\n\n`;
  });
  
  return formattedResults;
}

/**
 * Get web search context for a query
 * @param {string} query - User query
 * @returns {Promise<string>} - Web search context
 */
export async function getWebSearchContext(query) {
  // Check if the query needs web search
  if (!needsWebSearch(query)) {
    return '';
  }
  
  // Perform web search
  const searchResults = await performWebSearch(query);
  
  // Format search results
  return formatWebSearchResults(searchResults);
}