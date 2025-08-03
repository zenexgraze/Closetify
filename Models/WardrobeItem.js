const mongoose = require("mongoose");

const wardrobeItemSchema = new mongoose.Schema({
    user_id: String,
    type: String,
    color: String,
    pattern: String,
    image_url: String,
    created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("WardrobeItem", wardrobeItemSchema);
