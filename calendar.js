/**
 * Calendar Module
 * 
 * Handles calendar rendering and CRUD operations for daily entries.
 * Generates all dates for 2026 programmatically.
 */

import { db } from './firebase.js';
import { getCurrentUser } from './auth.js';
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    setDoc, 
    doc,
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Year for the calendar
const YEAR = 2026;

// Month names for display
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Day names for header
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Store entries for the currently viewed user
let currentEntries = {};
let viewingUserId = null;

/**
 * Format a date as YYYY-MM-DD
 * @param {Date} date 
 * @returns {string}
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Get the number of days in a month
 * @param {number} month - 0-indexed month
 * @param {number} year 
 * @returns {number}
 */
function getDaysInMonth(month, year) {
    return new Date(year, month + 1, 0).getDate();
}

/**
 * Get the day of week for the first day of a month (0 = Sunday)
 * @param {number} month - 0-indexed month
 * @param {number} year 
 * @returns {number}
 */
function getFirstDayOfMonth(month, year) {
    return new Date(year, month, 1).getDay();
}

/**
 * Load all entries for a specific user
 * @param {string} userId 
 * @returns {Promise<Object>} - Object mapping date strings to entry data
 */
export async function loadUserEntries(userId) {
    try {
        const entriesRef = collection(db, 'entries');
        const q = query(
            entriesRef, 
            where('userId', '==', userId),
            orderBy('date')
        );
        
        const snapshot = await getDocs(q);
        const entries = {};
        
        snapshot.forEach((doc) => {
            const data = doc.data();
            entries[data.date] = {
                id: doc.id,
                rating: data.rating,
                note: data.note
            };
        });
        
        currentEntries = entries;
        viewingUserId = userId;
        return entries;
    } catch (error) {
        console.error('Error loading entries:', error);
        throw error;
    }
}

/**
 * Save or update an entry for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {number} rating - Rating 1-5
 * @param {string} note - Short note text
 * @returns {Promise<void>}
 */
export async function saveEntry(date, rating, note) {
    const user = getCurrentUser();
    if (!user) {
        throw new Error('Must be logged in to save entries');
    }
    
    try {
        // Use a composite document ID for uniqueness: userId_date
        const docId = `${user.uid}_${date}`;
        const entryRef = doc(db, 'entries', docId);
        
        await setDoc(entryRef, {
            userId: user.uid,
            date: date,
            rating: parseInt(rating),
            note: note || ''
        });
        
        // Update local cache
        currentEntries[date] = {
            id: docId,
            rating: parseInt(rating),
            note: note || ''
        };
    } catch (error) {
        console.error('Error saving entry:', error);
        throw error;
    }
}

/**
 * Get all unique user IDs from entries
 * @returns {Promise<string[]>}
 */
export async function getAllUsers() {
    try {
        const entriesRef = collection(db, 'entries');
        const snapshot = await getDocs(entriesRef);
        
        const userIds = new Set();
        snapshot.forEach((doc) => {
            userIds.add(doc.data().userId);
        });
        
        return Array.from(userIds);
    } catch (error) {
        console.error('Error getting users:', error);
        throw error;
    }
}

/**
 * Get all entries for export
 * @returns {Promise<Array>}
 */
export async function getAllEntries() {
    try {
        const entriesRef = collection(db, 'entries');
        const q = query(entriesRef, orderBy('date'));
        const snapshot = await getDocs(q);
        
        const entries = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            entries.push({
                userId: data.userId,
                date: data.date,
                rating: data.rating,
                note: data.note
            });
        });
        
        return entries;
    } catch (error) {
        console.error('Error getting all entries:', error);
        throw error;
    }
}

/**
 * Render the calendar for a specific month
 * @param {number} month - 0-indexed month
 * @param {HTMLElement} container - Container element for the month grid
 * @param {boolean} isEditable - Whether the calendar is editable
 * @param {Function} onDayClick - Callback when a day is clicked
 */
function renderMonth(month, container, isEditable, onDayClick) {
    const daysInMonth = getDaysInMonth(month, YEAR);
    const firstDay = getFirstDayOfMonth(month, YEAR);
    
    // Create month card
    const card = document.createElement('div');
    card.className = 'card mb-4';
    
    // Month header
    const header = document.createElement('div');
    header.className = 'card-header bg-primary text-white';
    header.innerHTML = `<h5 class="mb-0">${MONTH_NAMES[month]} ${YEAR}</h5>`;
    card.appendChild(header);
    
    // Calendar grid
    const body = document.createElement('div');
    body.className = 'card-body p-2';
    
    // Day names header
    const dayNamesRow = document.createElement('div');
    dayNamesRow.className = 'row g-1 mb-1';
    DAY_NAMES.forEach(day => {
        const dayCol = document.createElement('div');
        dayCol.className = 'col text-center fw-bold small';
        dayCol.textContent = day;
        dayNamesRow.appendChild(dayCol);
    });
    body.appendChild(dayNamesRow);
    
    // Calendar weeks
    let currentWeek = document.createElement('div');
    currentWeek.className = 'row g-1 mb-1';
    
    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'col';
        currentWeek.appendChild(emptyCell);
    }
    
    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(YEAR, month, day);
        const dateStr = formatDate(date);
        const entry = currentEntries[dateStr];
        
        const dayCell = document.createElement('div');
        dayCell.className = 'col';
        
        const dayContent = document.createElement('div');
        dayContent.className = 'day-cell p-1 border rounded text-center';
        dayContent.dataset.date = dateStr;
        
        // Add rating-based color class
        if (entry && entry.rating) {
            dayContent.classList.add(`rating-${entry.rating}`);
        }
        
        // Make clickable if editable
        if (isEditable) {
            dayContent.classList.add('editable');
            dayContent.style.cursor = 'pointer';
            dayContent.addEventListener('click', () => onDayClick(dateStr, entry));
        }
        
        // Day number
        const dayNum = document.createElement('div');
        dayNum.className = 'fw-bold small';
        dayNum.textContent = day;
        dayContent.appendChild(dayNum);
        
        // Rating display
        if (entry && entry.rating) {
            const ratingDisplay = document.createElement('div');
            ratingDisplay.className = 'rating-stars small';
            ratingDisplay.textContent = '★'.repeat(entry.rating);
            dayContent.appendChild(ratingDisplay);
        }
        
        // Note preview (truncated)
        if (entry && entry.note) {
            const notePreview = document.createElement('div');
            notePreview.className = 'text-muted small text-truncate';
            notePreview.style.fontSize = '0.65rem';
            notePreview.textContent = entry.note.substring(0, 10);
            notePreview.title = entry.note;
            dayContent.appendChild(notePreview);
        }
        
        dayCell.appendChild(dayContent);
        currentWeek.appendChild(dayCell);
        
        // Start new week on Saturday
        if ((firstDay + day) % 7 === 0 && day < daysInMonth) {
            body.appendChild(currentWeek);
            currentWeek = document.createElement('div');
            currentWeek.className = 'row g-1 mb-1';
        }
    }
    
    // Fill remaining cells in last week
    const remainingCells = 7 - currentWeek.children.length;
    for (let i = 0; i < remainingCells && remainingCells < 7; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'col';
        currentWeek.appendChild(emptyCell);
    }
    
    if (currentWeek.children.length > 0) {
        body.appendChild(currentWeek);
    }
    
    card.appendChild(body);
    container.appendChild(card);
}

/**
 * Render the full year calendar
 * @param {HTMLElement} container - Container element for the calendar
 * @param {boolean} isEditable - Whether the calendar is editable
 * @param {Function} onDayClick - Callback when a day is clicked
 */
export function renderCalendar(container, isEditable, onDayClick) {
    container.innerHTML = '';
    
    // Create row for months (3 columns on large screens)
    const row = document.createElement('div');
    row.className = 'row';
    
    for (let month = 0; month < 12; month++) {
        const col = document.createElement('div');
        col.className = 'col-12 col-md-6 col-lg-4';
        renderMonth(month, col, isEditable, onDayClick);
        row.appendChild(col);
    }
    
    container.appendChild(row);
}

/**
 * Get the currently viewing user ID
 * @returns {string|null}
 */
export function getViewingUserId() {
    return viewingUserId;
}

/**
 * Get current entries cache
 * @returns {Object}
 */
export function getCurrentEntries() {
    return currentEntries;
}
