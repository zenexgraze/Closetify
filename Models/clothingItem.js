const mongoose = require('mongoose');

const clothingItemSchema = new mongoose.Schema({
    userId: {
        // type: mongoose.Schema.Types.ObjectId,
        type: String,
        ref: 'User',
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    contentType: {
        type: String,
        required: true
    },
    imageData: {
        type: Buffer,
        required: true
    },
    detectedItems: [
        {
            item: String,
            color: String
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ClothingItem', clothingItemSchema);
