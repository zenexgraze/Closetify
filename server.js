const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const connectDB = require('./Db/connect');
require('dotenv').config();

const verifyFirebaseToken = require('./Middleware/verifyfirebasetoken');
const userRoute = require('./Routes/users');
const uploadRoutes = require('./Routes/upload');
const stylistRoutes = require('./Routes/stylistRoute');
const notFound = require('./Error/not-found');
const errorHandler = require('./Error/error-handler');
const aichatroutes = require('./Routes/ai-chat');

// Routes here...



app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

app.use('/auth', require('./Routes/auth'));

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/home', verifyFirebaseToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});
app.use('/api/user', userRoute);
app.use('/api/stylist', verifyFirebaseToken, stylistRoutes);
app.use('/api', verifyFirebaseToken, uploadRoutes);


app.get('/tryon', verifyFirebaseToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ar.html'));
});

app.use('/ai-chat', aichatroutes);


app.use('/api/clothing', require('./Routes/clothing'));


app.use(notFound);           // Handle 404s
app.use(errorHandler);       // Handle thrown errors


const start = async () => {
    try {
        await connectDB(process.env.MONGODB_URI);
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port http://localhost:${process.env.PORT}`);
        });
    } catch (error) {
        console.log(error);
    }
}

start();