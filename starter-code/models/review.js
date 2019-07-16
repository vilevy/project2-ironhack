const mongoose = require('mongoose');

const { Schema } = mongoose;

const reviewSchema = new Schema({
  reviewedGuide: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewer: { type: Schema.Types.ObjectId, ref: 'User' },
  punctuality: { type: Number, min: 0, max: 5},
  professionalism: { type: Number, min: 0, max: 5},
  knowledge: { type: Number, min: 0, max: 5},
  itinerary: { type: Number, min: 0, max: 5},
  communication: { type: Number, min: 0, max: 5},
  reviewText: String,
},
{
  timestamps: true,
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
