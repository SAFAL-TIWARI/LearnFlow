import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Check if Firebase Admin has already been initialized
let firebaseAdmin;

if (!admin.apps.length) {
  try {
    // For production: Use environment variables
    if (process.env.FIREBASE_PRIVATE_KEY) {
      firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Replace escaped newlines in the private key
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    } 
    // For development: Use the service account file
    else {
      try {
        // Get the directory name of the current module
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        
        // Path to the service account file (2 levels up from lib folder)
        const serviceAccountPath = path.join(__dirname, '..', '..', 'learnflow-6e7ad-firebase-adminsdk-fbsvc-3bd056f68f.json');
        
        // Read and parse the service account file
        const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
        
        firebaseAdmin = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } catch (error) {
        console.error('Error initializing Firebase Admin from service account file:', error);
        throw error;
      }
    }
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
    throw error;
  }
}

export default admin;
export { firebaseAdmin };