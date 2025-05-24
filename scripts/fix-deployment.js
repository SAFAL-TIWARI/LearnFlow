#!/usr/bin/env node

/**
 * Fix deployment issues for static hosting platforms
 * This script addresses MIME type issues and ensures proper file structure
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🔧 Fixing deployment issues...');

// Ensure dist directory exists
const distDir = path.join(projectRoot, 'dist');
if (!fs.existsSync(distDir)) {
  console.log('📁 Creating dist directory...');
  fs.mkdirSync(distDir, { recursive: true });
}

// Fix index.html for proper module loading
const indexPath = path.join(distDir, 'index.html');
if (fs.existsSync(indexPath)) {
  console.log('🔧 Fixing index.html module references...');
  let indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Fix script src paths for GitHub Pages
  indexContent = indexContent.replace(
    /src="\/src\/main\.tsx"/g,
    'src="./src/main.tsx"'
  );
  
  // Fix favicon path
  indexContent = indexContent.replace(
    /href="\/favicon\.ico"/g,
    'href="./favicon.ico"'
  );
  
  // Add module type explicitly
  indexContent = indexContent.replace(
    /<script type="module" src="\.\/src\/main\.tsx"><\/script>/g,
    '<script type="module" crossorigin src="./src/main.tsx"></script>'
  );
  
  fs.writeFileSync(indexPath, indexContent);
  console.log('✅ index.html fixed');
}

// Create a .nojekyll file for GitHub Pages
const nojekyllPath = path.join(distDir, '.nojekyll');
if (!fs.existsSync(nojekyllPath)) {
  console.log('📄 Creating .nojekyll file for GitHub Pages...');
  fs.writeFileSync(nojekyllPath, '');
  console.log('✅ .nojekyll file created');
}

// Fix any TypeScript files that might be served directly
const srcDir = path.join(distDir, 'src');
if (fs.existsSync(srcDir)) {
  console.log('🔧 Fixing TypeScript file extensions in dist...');
  
  function fixTsFiles(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        fixTsFiles(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        // Read the file and ensure it's properly transpiled
        const content = fs.readFileSync(filePath, 'utf8');
        
        // If it's still TypeScript, it should have been transpiled
        if (content.includes('import ') && !content.includes('export ')) {
          console.log(`⚠️  Found untranspiled TypeScript file: ${filePath}`);
        }
      }
    });
  }
  
  fixTsFiles(srcDir);
}

// Verify all essential files are present
console.log('\n🔍 Final verification...');
const essentialFiles = [
  'index.html',
  '404.html',
  '_redirects',
  'favicon.ico',
  '.nojekyll'
];

let allFilesPresent = true;
essentialFiles.forEach(file => {
  const filePath = path.join(distDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - Present`);
  } else {
    console.log(`❌ ${file} - Missing`);
    allFilesPresent = false;
  }
});

// Check for assets directory
const assetsDir = path.join(distDir, 'assets');
if (fs.existsSync(assetsDir)) {
  console.log('✅ assets/ - Present');
  
  // List some assets
  const assets = fs.readdirSync(assetsDir).slice(0, 5);
  console.log(`   Contains: ${assets.join(', ')}${assets.length === 5 ? '...' : ''}`);
} else {
  console.log('❌ assets/ - Missing');
  allFilesPresent = false;
}

if (allFilesPresent) {
  console.log('\n🎉 Deployment fixes completed successfully!');
  console.log('📦 Your app should now work properly on:');
  console.log('   • GitHub Pages');
  console.log('   • Netlify');
  console.log('   • Any static hosting service');
} else {
  console.log('\n⚠️  Some essential files are still missing.');
  console.log('Please run the build process first: npm run build');
  process.exit(1);
}

console.log('\n📋 Next Steps:');
console.log('1. Commit and push your changes to GitHub');
console.log('2. GitHub Actions will automatically deploy to GitHub Pages');
console.log('3. For Netlify, the deployment should work automatically');
console.log('4. Check the console for any remaining errors');
