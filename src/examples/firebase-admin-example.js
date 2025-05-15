// Example of using Firebase Admin SDK
import admin from '../lib/firebase-admin';

/**
 * Example function to get a user by their UID
 * @param {string} uid - The user's UID
 * @returns {Promise<Object|null>} - The user object or null if not found
 */
export async function getUserById(uid) {
  try {
    const userRecord = await admin.auth().getUser(uid);
    return userRecord;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Example function to create a new user
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {Object} additionalInfo - Additional user information
 * @returns {Promise<Object|null>} - The created user object or null if failed
 */
export async function createUser(email, password, additionalInfo = {}) {
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: additionalInfo.displayName,
      photoURL: additionalInfo.photoURL,
      emailVerified: additionalInfo.emailVerified || false,
      disabled: additionalInfo.disabled || false,
    });
    return userRecord;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

/**
 * Example function to verify an ID token
 * @param {string} idToken - The ID token to verify
 * @returns {Promise<Object|null>} - The decoded token or null if invalid
 */
export async function verifyIdToken(idToken) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    return null;
  }
}

/**
 * Example function to store data in Firestore
 * @param {string} collection - The collection name
 * @param {string} docId - The document ID
 * @param {Object} data - The data to store
 * @returns {Promise<boolean>} - Whether the operation was successful
 */
export async function storeDataInFirestore(collection, docId, data) {
  try {
    await admin.firestore().collection(collection).doc(docId).set(data, { merge: true });
    return true;
  } catch (error) {
    console.error('Error storing data in Firestore:', error);
    return false;
  }
}

/**
 * Example function to get data from Firestore
 * @param {string} collection - The collection name
 * @param {string} docId - The document ID
 * @returns {Promise<Object|null>} - The document data or null if not found
 */
export async function getDataFromFirestore(collection, docId) {
  try {
    const doc = await admin.firestore().collection(collection).doc(docId).get();
    if (doc.exists) {
      return doc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting data from Firestore:', error);
    return null;
  }
}