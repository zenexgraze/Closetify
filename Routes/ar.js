const express = require('express');
const router = express.Router();
const admin = require('../Config/firebase'); // your firebase.js
const path = require('path');

router.get('/ar', async (req, res) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const userId = decodedToken.uid;

        res.sendFile(path.join(__dirname, '../Public/ar.html')); // or use a template instead
    } catch (error) {
        return res.status(401).send('Unauthorized');
    }
});

module.exports = router;
