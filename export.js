/**
 * Export Module
 * 
 * Handles exporting calendar entries to CSV and JSON formats.
 * Triggers browser file downloads without requiring a server.
 */

import { getAllEntries } from './calendar.js';

/**
 * Download a file in the browser
 * @param {string} content - File content
 * @param {string} filename - Name of the file to download
 * @param {string} mimeType - MIME type of the file
 */
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
}

/**
 * Export all entries as CSV
 * @returns {Promise<void>}
 */
export async function exportCSV() {
    try {
        const entries = await getAllEntries();
        
        // CSV header
        const header = 'userId,date,rating,note';
        
        // CSV rows
        const rows = entries.map(entry => {
            // Escape quotes in note and wrap in quotes if contains comma
            const note = entry.note || '';
            const escapedNote = note.includes(',') || note.includes('"') 
                ? `"${note.replace(/"/g, '""')}"` 
                : note;
            
            return `${entry.userId},${entry.date},${entry.rating},${escapedNote}`;
        });
        
        const csv = [header, ...rows].join('\n');
        downloadFile(csv, 'daydicated-2026.csv', 'text/csv');
        
        console.log(`Exported ${entries.length} entries to CSV`);
    } catch (error) {
        console.error('Error exporting CSV:', error);
        throw error;
    }
}

/**
 * Export all entries as JSON
 * @returns {Promise<void>}
 */
export async function exportJSON() {
    try {
        const entries = await getAllEntries();
        
        const json = JSON.stringify(entries, null, 2);
        downloadFile(json, 'daydicated-2026.json', 'application/json');
        
        console.log(`Exported ${entries.length} entries to JSON`);
    } catch (error) {
        console.error('Error exporting JSON:', error);
        throw error;
    }
}
