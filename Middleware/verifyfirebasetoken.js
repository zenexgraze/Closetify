const admin = require('../Config/firebase');

const verifyFirebaseToken = async (req, res, next) => {
    const idToken = req.cookies.token;
    if (!idToken) return res.redirect('/login');

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        // console.log('User authenticated:', req.user);
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        res.clearCookie('token');
        res.redirect('/login');
    }
};

module.exports = verifyFirebaseToken;
