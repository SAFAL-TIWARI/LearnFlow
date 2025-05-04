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

// Root project directory (adjust as needed)
const PROJECT_ROOT = path.resolve(__dirname, '../../');

/**
 * Recursively scan a directory for files matching specified extensions
 * @param {string} dir - Directory to scan
 * @param {string[]} extensions - File extensions to include
 * @param {string[]} excludeDirs - Directories to exclude
 * @returns {Promise<string[]>} - Array of file paths
 */
export async function scanDirectory(dir, extensions = [], excludeDirs = []) {
  try {
    const entries = await readdirAsync(dir);
    const files = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(dir, entry);
        
        try {
          const stat = await statAsync(fullPath);
          
          // Skip excluded directories
          if (stat.isDirectory()) {
            if (excludeDirs.includes(entry) || entry.startsWith('.') || entry === 'node_modules') {
              return [];
            }
            return scanDirectory(fullPath, extensions, excludeDirs);
          }
          
          // Check if file has one of the specified extensions
          if (extensions.length === 0 || extensions.includes(path.extname(entry).toLowerCase())) {
            return [fullPath];
          }
          
          return [];
        } catch (err) {
          console.error(`Error accessing ${fullPath}:`, err.message);
          return [];
        }
      })
    );
    
    return files.flat();
  } catch (err) {
    console.error(`Error scanning directory ${dir}:`, err.message);
    return [];
  }
}

/**
 * Read file content and return it with file info
 * @param {string} filePath - Path to the file
 * @returns {Promise<Object>} - File info and content
 */
export async function readFileContent(filePath) {
  try {
    const content = await readFileAsync(filePath, 'utf8');
    const relativePath = path.relative(PROJECT_ROOT, filePath);
    const extension = path.extname(filePath).toLowerCase();
    
    return {
      path: relativePath,
      extension,
      content,
      size: content.length,
      lines: content.split('\n').length
    };
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err.message);
    return null;
  }
}

/**
 * Scan project files for potential issues
 * @param {string} scanPath - Path to scan (relative to project root)
 * @param {string[]} extensions - File extensions to scan
 * @returns {Promise<Object>} - Scan results
 */
export async function scanProjectFiles(scanPath = '', extensions = ['.html', '.css', '.js', '.jsx', '.ts', '.tsx', '.json', '.env']) {
  try {
    // Resolve the scan path relative to project root
    const fullScanPath = path.resolve(PROJECT_ROOT, scanPath || '');
    
    // Check if path exists
    try {
      await statAsync(fullScanPath);
    } catch (err) {
      return {
        success: false,
        error: `Path does not exist: ${scanPath}`,
        scannedFiles: 0
      };
    }
    
    // Get all files matching extensions
    const files = await scanDirectory(
      fullScanPath, 
      extensions,
      ['node_modules', 'dist', 'build', '.git', '.github']
    );
    
    // Limit to 20 files for performance
    const filesToScan = files.slice(0, 20);
    
    // Read file contents
    const fileContents = await Promise.all(
      filesToScan.map(file => readFileContent(file))
    );
    
    // Filter out null results
    const validFiles = fileContents.filter(file => file !== null);
    
    return {
      success: true,
      scannedFiles: validFiles.length,
      totalFiles: files.length,
      scanPath: scanPath || '/',
      files: validFiles
    };
  } catch (err) {
    console.error('Error scanning project files:', err);
    return {
      success: false,
      error: err.message,
      scannedFiles: 0
    };
  }
}

/**
 * Check if user is authorized for admin commands
 * @param {string} userId - User ID or identifier
 * @param {string} command - Command being executed
 * @returns {boolean} - Whether user is authorized
 */
export function isAuthorizedForAdminCommands(userId, command) {
  // In a real app, you would check against a database of admin users
  // For this example, we'll use a simple check
  const adminUsers = ['admin', 'developer'];
  return adminUsers.includes(userId);
}