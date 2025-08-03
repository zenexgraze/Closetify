const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    data: Buffer,
    contentType: String,
    uploadedAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Image', imageSchema);
