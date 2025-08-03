const admin = require('firebase-admin');
require('dotenv').config();

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error("❌ FIREBASE_CONFIG not found in environment variables.");
    process.exit(1);
}

// Automatically reads from process.env.GOOGLE_APPLICATION_CREDENTIALS
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
});

module.exports = admin;
