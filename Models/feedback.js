const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    user_id: String,
    suggestion: String,
    rating: Number,
    created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Feedback", feedbackSchema);
