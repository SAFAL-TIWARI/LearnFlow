/**
 * Website Knowledge Utilities for the LearnFlow chatbot
 * This module helps the chatbot understand and access website content
 */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const readFileAsync = promisify(fs.readFile);
const readdirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Root project directory
const PROJECT_ROOT = path.resolve(__dirname, '../../');

// Resources directory (adjust as needed)
const RESOURCES_DIR = path.join(PROJECT_ROOT, 'resources');

// File types to index
const INDEXABLE_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt', '.md', '.json'];

// Resource database (will be populated by scanning)
let resourceDatabase = {
  assignments: [],
  notes: [],
  labManuals: [],
  downloads: []
};

/**
 * Initialize the resource database by scanning files (without creating directories)
 */
export async function initializeResourceDatabase() {
  try {
    // Only scan existing directories, don't create new ones
    await scanResourceDirectory();
    
    // Load downloads.json if it exists (don't create it)
    const downloadsPath = path.join(RESOURCES_DIR, 'downloads.json');
    if (fs.existsSync(downloadsPath)) {
      try {
        const downloadsData = await readFileAsync(downloadsPath, 'utf8');
        const downloads = JSON.parse(downloadsData);
        resourceDatabase.downloads = downloads;
        console.log(`Loaded ${downloads.length} items from downloads.json`);
      } catch (error) {
        console.error('Error loading downloads.json:', error);
      }
    }
    
    console.log('Resource database initialized');
    console.log(`Found ${resourceDatabase.assignments.length} assignments`);
    console.log(`Found ${resourceDatabase.notes.length} notes`);
    console.log(`Found ${resourceDatabase.labManuals.length} lab manuals`);
    console.log(`Found ${resourceDatabase.downloads.length} downloads`);
    
    return resourceDatabase;
  } catch (error) {
    console.error('Error initializing resource database:', error);
    // Return empty database instead of null to prevent further errors
    return {
      assignments: [],
      notes: [],
      labManuals: [],
      downloads: []
    };
  }
}

/**
 * Create resource directories if they don't exist (call this only when needed)
 */
export async function createResourceDirectories() {
  try {
    // Create resources directory if it doesn't exist
    if (!fs.existsSync(RESOURCES_DIR)) {
      try {
        fs.mkdirSync(RESOURCES_DIR, { recursive: true });
        console.log('Created resources directory');
      } catch (mkdirError) {
        console.warn('Could not create resources directory:', mkdirError.message);
        return false;
      }
    }
    
    // Create required subdirectories
    const requiredDirs = [
      path.join(RESOURCES_DIR, 'assignments'),
      path.join(RESOURCES_DIR, 'notes'),
      path.join(RESOURCES_DIR, 'lab-manuals')
    ];
    
    for (const dir of requiredDirs) {
      if (!fs.existsSync(dir)) {
        try {
          fs.mkdirSync(dir, { recursive: true });
          console.log(`Created directory: ${dir}`);
        } catch (mkdirError) {
          console.warn(`Could not create directory ${dir}:`, mkdirError.message);
        }
      }
    }
    
    // Create empty downloads.json if it doesn't exist
    const downloadsPath = path.join(RESOURCES_DIR, 'downloads.json');
    if (!fs.existsSync(downloadsPath)) {
      try {
        fs.writeFileSync(downloadsPath, JSON.stringify([], null, 2));
        console.log('Created empty downloads.json file');
      } catch (writeError) {
        console.warn('Could not create downloads.json:', writeError.message);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error creating resource directories:', error);
    return false;
  }
}

/**
 * Scan the resources directory for files
 */
async function scanResourceDirectory() {
  try {
    // Check if resources directory exists
    if (!fs.existsSync(RESOURCES_DIR)) {
      console.warn('Resources directory does not exist');
      // Initialize with empty arrays
      resourceDatabase.assignments = [];
      resourceDatabase.notes = [];
      resourceDatabase.labManuals = [];
      return;
    }
    
    // Scan assignments directory
    const assignmentsDir = path.join(RESOURCES_DIR, 'assignments');
    try {
      if (fs.existsSync(assignmentsDir)) {
        resourceDatabase.assignments = await scanDirectory(assignmentsDir, INDEXABLE_EXTENSIONS);
      } else {
        resourceDatabase.assignments = [];
        console.log('Assignments directory does not exist, using empty array');
      }
    } catch (err) {
      console.warn('Error scanning assignments directory:', err.message);
      resourceDatabase.assignments = [];
    }
    
    // Scan notes directory
    const notesDir = path.join(RESOURCES_DIR, 'notes');
    try {
      if (fs.existsSync(notesDir)) {
        resourceDatabase.notes = await scanDirectory(notesDir, INDEXABLE_EXTENSIONS);
      } else {
        resourceDatabase.notes = [];
        console.log('Notes directory does not exist, using empty array');
      }
    } catch (err) {
      console.warn('Error scanning notes directory:', err.message);
      resourceDatabase.notes = [];
    }
    
    // Scan lab manuals directory
    const labManualsDir = path.join(RESOURCES_DIR, 'lab-manuals');
    try {
      if (fs.existsSync(labManualsDir)) {
        resourceDatabase.labManuals = await scanDirectory(labManualsDir, INDEXABLE_EXTENSIONS);
      } else {
        resourceDatabase.labManuals = [];
        console.log('Lab manuals directory does not exist, using empty array');
      }
    } catch (err) {
      console.warn('Error scanning lab manuals directory:', err.message);
      resourceDatabase.labManuals = [];
    }
  } catch (error) {
    console.error('Error scanning resource directory:', error);
    // Initialize with empty arrays in case of error
    resourceDatabase.assignments = [];
    resourceDatabase.notes = [];
    resourceDatabase.labManuals = [];
  }
}

/**
 * Scan a directory for files with specified extensions
 * @param {string} dir - Directory to scan
 * @param {string[]} extensions - File extensions to include
 * @returns {Promise<Array>} - Array of file info objects
 */
async function scanDirectory(dir, extensions = []) {
  try {
    // Check if directory exists before attempting to read it
    if (!fs.existsSync(dir)) {
      console.warn(`Directory does not exist: ${dir}`);
      return [];
    }
    
    let entries;
    try {
      entries = await readdirAsync(dir);
    } catch (readError) {
      console.warn(`Could not read directory ${dir}:`, readError.message);
      return [];
    }
    
    const files = [];
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      
      try {
        // Check if path exists before getting stats
        if (!fs.existsSync(fullPath)) {
          continue;
        }
        
        const stat = await statAsync(fullPath);
        
        if (stat.isDirectory()) {
          // Recursively scan subdirectories
          try {
            const subFiles = await scanDirectory(fullPath, extensions);
            files.push(...subFiles);
          } catch (subDirError) {
            console.warn(`Error scanning subdirectory ${fullPath}:`, subDirError.message);
            // Continue with other entries
          }
        } else if (extensions.includes(path.extname(entry).toLowerCase())) {
          // Add file info to the list
          const relativePath = path.relative(PROJECT_ROOT, fullPath);
          files.push({
            name: entry,
            path: relativePath,
            fullPath: fullPath,
            extension: path.extname(entry).toLowerCase(),
            size: stat.size,
            modified: stat.mtime
          });
        }
      } catch (err) {
        console.warn(`Error accessing ${fullPath}:`, err.message);
        // Continue with other entries
      }
    }
    
    return files;
  } catch (err) {
    console.warn(`Error scanning directory ${dir}:`, err.message);
    return [];
  }
}

/**
 * Search for resources matching a query
 * @param {string} query - Search query
 * @returns {Object} - Search results
 */
export function searchResources(query) {
  const normalizedQuery = query.toLowerCase();
  
  // Search in assignments
  const matchingAssignments = resourceDatabase.assignments.filter(file => 
    file.name.toLowerCase().includes(normalizedQuery) ||
    file.path.toLowerCase().includes(normalizedQuery)
  );
  
  // Search in notes
  const matchingNotes = resourceDatabase.notes.filter(file => 
    file.name.toLowerCase().includes(normalizedQuery) ||
    file.path.toLowerCase().includes(normalizedQuery)
  );
  
  // Search in lab manuals
  const matchingLabManuals = resourceDatabase.labManuals.filter(file => 
    file.name.toLowerCase().includes(normalizedQuery) ||
    file.path.toLowerCase().includes(normalizedQuery)
  );
  
  // Search in downloads
  const matchingDownloads = resourceDatabase.downloads.filter(item => 
    (item.title && item.title.toLowerCase().includes(normalizedQuery)) ||
    (item.description && item.description.toLowerCase().includes(normalizedQuery)) ||
    (item.tags && item.tags.some(tag => tag.toLowerCase().includes(normalizedQuery)))
  );
  
  return {
    assignments: matchingAssignments,
    notes: matchingNotes,
    labManuals: matchingLabManuals,
    downloads: matchingDownloads,
    totalResults: matchingAssignments.length + matchingNotes.length + 
                  matchingLabManuals.length + matchingDownloads.length
  };
}

/**
 * Extract course code from a query
 * @param {string} query - User query
 * @returns {string|null} - Course code if found
 */
export function extractResourceInfo(query) {
  // Extract course code (e.g., CHB 101, CSE201)
  const courseCodeRegex = /\b([A-Za-z]{2,3})\s*(\d{3})\b/i;
  const courseMatch = query.match(courseCodeRegex);
  
  // Extract unit number (e.g., Unit 1, Unit 2)
  const unitRegex = /\bunit\s*(\d+)\b/i;
  const unitMatch = query.match(unitRegex);
  
  // Extract semester number (e.g., 1st semester, 2nd sem)
  const semesterRegex = /\b(\d)(st|nd|rd|th)?\s+sem(ester)?\b/i;
  const semesterMatch = query.match(semesterRegex);
  
  // Extract resource type (e.g., PDF, notes, lab manual)
  const resourceTypeRegex = /\b(pdf|notes|manual|assignment|lab|download)\b/i;
  const resourceTypeMatch = query.match(resourceTypeRegex);
  
  return {
    courseCode: courseMatch ? `${courseMatch[1]}${courseMatch[2]}`.toUpperCase() : null,
    unit: unitMatch ? parseInt(unitMatch[1]) : null,
    semester: semesterMatch ? parseInt(semesterMatch[1]) : null,
    resourceType: resourceTypeMatch ? resourceTypeMatch[1].toLowerCase() : null
  };
}

/**
 * Get contextual information based on user query
 * @param {string} query - User query
 * @returns {string} - Contextual information
 */
export function getQueryContext(query) {
  // Extract resource information
  const resourceInfo = extractResourceInfo(query);
  
  // Search for matching resources
  const searchResults = searchResources(query);
  
  // Build context string
  let context = '';
  
  if (resourceInfo.courseCode) {
    context += `The user is asking about course ${resourceInfo.courseCode}. `;
  }
  
  if (resourceInfo.unit) {
    context += `They are specifically interested in Unit ${resourceInfo.unit}. `;
  }
  
  if (resourceInfo.semester) {
    context += `They are looking for Semester ${resourceInfo.semester} materials. `;
  }
  
  if (resourceInfo.resourceType) {
    context += `They want to find ${resourceInfo.resourceType} resources. `;
  }
  
  // Add information about matching resources
  if (searchResults.totalResults > 0) {
    context += `\nI found ${searchResults.totalResults} resources that might be relevant:\n`;
    
    if (searchResults.assignments.length > 0) {
      context += `- ${searchResults.assignments.length} assignments\n`;
      searchResults.assignments.slice(0, 3).forEach(file => {
        context += `  * ${file.name} (${file.path})\n`;
      });
    }
    
    if (searchResults.notes.length > 0) {
      context += `- ${searchResults.notes.length} notes\n`;
      searchResults.notes.slice(0, 3).forEach(file => {
        context += `  * ${file.name} (${file.path})\n`;
      });
    }
    
    if (searchResults.labManuals.length > 0) {
      context += `- ${searchResults.labManuals.length} lab manuals\n`;
      searchResults.labManuals.slice(0, 3).forEach(file => {
        context += `  * ${file.name} (${file.path})\n`;
      });
    }
    
    if (searchResults.downloads.length > 0) {
      context += `- ${searchResults.downloads.length} downloads\n`;
      searchResults.downloads.slice(0, 3).forEach(item => {
        context += `  * ${item.title} (${item.url || 'No URL provided'})\n`;
      });
    }
  }
  
  return context;
}

// Note: Resource database initialization is now done manually when needed
// Call initializeResourceDatabase() explicitly if you need to scan existing resources
// Call createResourceDirectories() if you need to create the directory structure