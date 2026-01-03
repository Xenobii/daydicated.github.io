# Daydicated 2026

A simple web app for tracking your daily moods and notes throughout 2026.

## Features

- 📅 **Daily Calendar** - View and rate each day of 2026
- ⭐ **Rating System** - Rate each day from 1-5 stars
- 📝 **Daily Notes** - Add short notes to remember key moments
- 👥 **Multi-User** - View other users' calendars (read-only)
- 📤 **Export** - Download all data as CSV or JSON

## Tech Stack

- **Frontend**: HTML5, Bootstrap 5, Vanilla JavaScript (ES6 modules)
- **Backend**: Firebase (Authentication + Firestore)
- **Hosting**: GitHub Pages

## Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** with Email/Password provider
4. Create a **Firestore Database**

### 2. Configure Firebase Credentials

Edit `firebase.js` and replace the placeholder values with your Firebase project credentials:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 3. Set Up Firestore Security Rules

In the Firebase Console, go to Firestore Database → Rules and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /entries/{entryId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                   request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 4. Create User Accounts

In Firebase Console → Authentication → Users, manually create accounts for your users with email/password.

### 5. Deploy to GitHub Pages

1. Push this repository to GitHub
2. Go to Settings → Pages
3. Select the branch to deploy (usually `main`)
4. Your app will be available at `https://[username].github.io/[repo-name]/`

## File Structure

```
/
├── index.html        # Login + main UI
├── app.js            # Main application logic
├── firebase.js       # Firebase config and initialization
├── auth.js           # Login / logout logic
├── calendar.js       # Calendar rendering and CRUD
├── export.js         # CSV / JSON export logic
├── styles.css        # Minimal custom styling
└── README.md         # This file
```

## Database Schema

**Collection**: `entries`

Each document contains:

```json
{
  "userId": "string",
  "date": "YYYY-MM-DD",
  "rating": 1-5,
  "note": "string"
}
```

## Usage

1. Open the app and log in with your email/password
2. Click any day to rate it and add a note
3. Use the dropdown to view other users' calendars
4. Export all data using the CSV or JSON buttons

## Rating Colors

- 🔴 **1** - Poor day
- 🟠 **2** - Below average
- 🟡 **3** - Average
- 🟢 **4** - Good day
- 🟢 **5** - Excellent day

## License

MIT License - Feel free to use and modify!
