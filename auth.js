/**
 * Authentication Module
 * 
 * Handles user login and logout functionality using Firebase Authentication.
 * Uses email/password authentication only.
 */

import { auth } from './firebase.js';
import { 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Current authenticated user
let currentUser = null;

/**
 * Login with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} - The authenticated user object
 */
export async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        currentUser = userCredential.user;
        return currentUser;
    } catch (error) {
        console.error('Login error:', error.message);
        throw error;
    }
}

/**
 * Logout the current user
 * @returns {Promise<void>}
 */
export async function logout() {
    try {
        await signOut(auth);
        currentUser = null;
    } catch (error) {
        console.error('Logout error:', error.message);
        throw error;
    }
}

/**
 * Get the current authenticated user
 * @returns {Object|null} - The current user or null if not authenticated
 */
export function getCurrentUser() {
    return currentUser || auth.currentUser;
}

/**
 * Subscribe to authentication state changes
 * @param {Function} callback - Callback function called when auth state changes
 * @returns {Function} - Unsubscribe function
 */
export function onAuthChange(callback) {
    return onAuthStateChanged(auth, (user) => {
        currentUser = user;
        callback(user);
    });
}

/**
 * Check if a user is currently logged in
 * @returns {boolean}
 */
export function isLoggedIn() {
    return getCurrentUser() !== null;
}
