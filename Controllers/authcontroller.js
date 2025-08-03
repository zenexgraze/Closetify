const User = require('../Models/users');
const admin = require('../Config/firebase');

const loginUser = async (req, res) => {
    const { idToken } = req.body;

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        // console.log('Decoded Token:', decodedToken);
        const { uid, email, firebase } = decodedToken;

        const userRecord = await admin.auth().getUser(uid);
        const displayName = userRecord.displayName || "No name";

        let user = await User.findOne({ _id: uid });

        if (!user) {
            user = await User.create({
                _id: uid,
                email,
                // name: decodedToken.name || "No name",
                name: displayName || "No name",
                authProvider: firebase.sign_in_provider,
            });
        }

        res.cookie('token', idToken, {
            httpOnly: true,
        });
        res.status(200).json({ message: 'Logged in successfully' });

    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};

const logoutUser = (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
};

module.exports = { loginUser, logoutUser };
