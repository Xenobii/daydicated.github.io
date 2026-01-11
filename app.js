/**
 * Main Application Module
 * 
 * Orchestrates the Daydicated app functionality.
 * Handles UI interactions, authentication state, and calendar display.
 */

import { login, logout, onAuthChange, getCurrentUser } from './auth.js';
import { 
    loadUserEntries, 
    saveEntry, 
    renderCalendar, 
    getAllUsers,
    getCurrentEntries 
} from './calendar.js';
import { exportCSV, exportJSON } from './export.js';

// DOM Elements
let loginSection, appSection, loginForm, logoutBtn, userEmailSpan;
let userSelector, calendarContainer, editModal, editForm;
let editDateSpan, editRatingInput, editNoteInput;
let exportCsvBtn, exportJsonBtn, loadingSpinner;
let editModalInstance;

/**
 * Initialize DOM element references
 */
function initElements() {
    loginSection = document.getElementById('login-section');
    appSection = document.getElementById('app-section');
    loginForm = document.getElementById('login-form');
    logoutBtn = document.getElementById('logout-btn');
    userEmailSpan = document.getElementById('user-email');
    userSelector = document.getElementById('user-selector');
    calendarContainer = document.getElementById('calendar-container');
    editModal = document.getElementById('edit-modal');
    editForm = document.getElementById('edit-form');
    editDateSpan = document.getElementById('edit-date');
    editRatingInput = document.getElementById('edit-rating');
    editNoteInput = document.getElementById('edit-note');
    exportCsvBtn = document.getElementById('export-csv-btn');
    exportJsonBtn = document.getElementById('export-json-btn');
    loadingSpinner = document.getElementById('loading-spinner');
    
    // Initialize Bootstrap modal
    editModalInstance = new bootstrap.Modal(editModal);
}

/**
 * Show or hide the loading spinner
 * @param {boolean} show 
 */
function showLoading(show) {
    if (loadingSpinner) {
        loadingSpinner.style.display = show ? 'flex' : 'none';
    }
}

/**
 * Show an alert message
 * @param {string} message 
 * @param {string} type - Bootstrap alert type (success, danger, warning, info)
 */
function showAlert(message, type = 'danger') {
    const alertContainer = document.getElementById('alert-container');
    if (!alertContainer) return;
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.role = 'alert';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    alertContainer.appendChild(alert);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

/**
 * Handle user login
 * @param {Event} e 
 */
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    showLoading(true);
    
    try {
        await login(email, password);
        loginForm.reset();
    } catch (error) {
        showAlert(`Login failed: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

/**
 * Handle user logout
 */
async function handleLogout() {
    showLoading(true);
    
    try {
        await logout();
    } catch (error) {
        showAlert(`Logout failed: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

/**
 * Load and populate the user selector dropdown
 */
async function loadUserSelector() {
    try {
        const users = await getAllUsers(); // now returns [{ uid, email }]
        const currentUser = getCurrentUser();

        // Clear existing options
        userSelector.innerHTML = '<option value="">Select a user...</option>';

        // Add current user first (always show current user)
        if (currentUser) {
            const option = document.createElement('option');
            option.value = currentUser.uid;
            option.textContent = `${currentUser.email} (You)`;
            option.selected = true;
            userSelector.appendChild(option);
        }

        // Add other users with emails when available
        users.forEach(userObj => {
            const uid = userObj.uid || userObj;
            const email = userObj.email || null;
            if (uid !== currentUser?.uid) {
                const option = document.createElement('option');
                option.value = uid;
                option.textContent = email ? email : (uid.substring ? uid.substring(0, 8) + '...' : String(uid));
                userSelector.appendChild(option);
            }
        });
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

/**
 * Handle day cell click to open edit modal
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {Object|null} entry - Existing entry data or null
 */
function handleDayClick(date, entry) {
    editDateSpan.textContent = date;
    editRatingInput.value = entry?.rating || 3;
    editNoteInput.value = entry?.note || '';
    
    editModalInstance.show();
}

/**
 * Handle edit form submission
 * @param {Event} e 
 */
async function handleEditSubmit(e) {
    e.preventDefault();
    
    const date = editDateSpan.textContent;
    const rating = editRatingInput.value;
    const note = editNoteInput.value.trim();
    
    showLoading(true);
    
    try {
        await saveEntry(date, rating, note);
        editModalInstance.hide();
        
        // Reload calendar to show updated entry
        await displayCalendar(getCurrentUser().uid);
        
        showAlert('Entry saved successfully!', 'success');
    } catch (error) {
        showAlert(`Failed to save entry: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

/**
 * Handle user selector change
 */
async function handleUserChange() {
    const selectedUserId = userSelector.value;
    if (!selectedUserId) return;
    
    showLoading(true);
    
    try {
        await displayCalendar(selectedUserId);
    } catch (error) {
        showAlert(`Failed to load calendar: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

/**
 * Display calendar for a specific user
 * @param {string} userId 
 */
async function displayCalendar(userId) {
    await loadUserEntries(userId);
    
    const currentUser = getCurrentUser();
    const isEditable = currentUser && currentUser.uid === userId;
    
    renderCalendar(calendarContainer, isEditable, handleDayClick);
}

/**
 * Handle CSV export
 */
async function handleExportCSV() {
    showLoading(true);
    
    try {
        await exportCSV();
        showAlert('CSV exported successfully!', 'success');
    } catch (error) {
        showAlert(`Export failed: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

/**
 * Handle JSON export
 */
async function handleExportJSON() {
    showLoading(true);
    
    try {
        await exportJSON();
        showAlert('JSON exported successfully!', 'success');
    } catch (error) {
        showAlert(`Export failed: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

/**
 * Handle authentication state changes
 * @param {Object|null} user 
 */
async function handleAuthStateChange(user) {
    if (user) {
        // User is logged in
        loginSection.style.display = 'none';
        appSection.style.display = 'block';
        userEmailSpan.textContent = user.email;
        
        showLoading(true);
        
        try {
            await loadUserSelector();
            await displayCalendar(user.uid);
        } catch (error) {
            console.error('Error initializing app:', error);
            showAlert('Failed to load calendar data');
        } finally {
            showLoading(false);
        }
    } else {
        // User is logged out
        loginSection.style.display = 'block';
        appSection.style.display = 'none';
        calendarContainer.innerHTML = '';
    }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    userSelector.addEventListener('change', handleUserChange);
    editForm.addEventListener('submit', handleEditSubmit);
    exportCsvBtn.addEventListener('click', handleExportCSV);
    exportJsonBtn.addEventListener('click', handleExportJSON);
}

/**
 * Initialize the application
 */
function init() {
    initElements();
    setupEventListeners();
    onAuthChange(handleAuthStateChange);
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
