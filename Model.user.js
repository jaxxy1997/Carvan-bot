const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: String,
    warnings: [
        {
            reason: String,
            date: { type: Date, default: Date.now }
        }
    ]
});

module.exports = mongoose.model('User', userSchema);
