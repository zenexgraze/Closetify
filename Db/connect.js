const mongoose = require('mongoose');

const connectDB = async (url) => {
    try {
        console.log('✅MongoDB connected successfully');
        await mongoose.connect(url,{});
    } catch (error) {
        console.error('❌Error connecting to MongoDB:', error);
    }


}

module.exports = connectDB;
