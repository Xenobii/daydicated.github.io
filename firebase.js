/**
 * Firebase Configuration and Initialization
 * 
 * This module initializes Firebase with the project configuration
 * and exports the auth and firestore instances for use throughout the app.
 * 
 * IMPORTANT: Replace the firebaseConfig values with your actual Firebase project credentials.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase configuration - REPLACE WITH YOUR PROJECT CREDENTIALS
const firebaseConfig = {
  apiKey: "AIzaSyCZ9hpxjSUBdFAbehd2MHyZbQJEpZPGydo",
  authDomain: "daydicated.firebaseapp.com",
  projectId: "daydicated",
  storageBucket: "daydicated.firebasestorage.app",
  messagingSenderId: "343184368908",
  appId: "1:343184368908:web:ff4788a144ffa3f0b15529"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore
export const db = getFirestore(app);

export default app;
