const mongoose = require('mongoose');

const AccommodationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['Affitti Brevi', 'Affitti Lunghi', 'Case Vacanza'],
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    images: [String],
    datePosted: {
        type: Date,
        default: Date.now,
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
});

module.exports = mongoose.model('Accommodation', AccommodationSchema);
