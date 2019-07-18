const mongoose = require('mongoose');

const { Schema } = mongoose;

const itinerarySchema = new Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  date: { type: String, required: true },
  description: { type: String, required: true },
  places: { type: [{}], required: true },
  capacity: { type: Number, required: true },
  remainingCapacity: { type: Number, required: true },
  languages: { type: Array, required: true },
  categories: Array,
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  // subscribers: [{ type: Schema.Types.ObjectId, ref: 'User' }, Number],
  subscribers: [{ tourist: { type: Schema.Types.ObjectId, ref: 'User' }, number: Number }],
},
{
  timestamps: true,
});

const Itinerary = mongoose.model('Itinerary', itinerarySchema);

module.exports = Itinerary;
