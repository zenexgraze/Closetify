const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    _id: {
        type: String,  // Store Firebase UID as _id
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);
