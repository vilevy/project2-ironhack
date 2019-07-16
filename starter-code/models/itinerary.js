const mongoose = require('mongoose');

const { Schema } = mongoose;

const itinerarySchema = new Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  places: { type: [{
    startTime: String,
    endTime: String,
    place: {
      place_id: String,
      lat: Number,
      long: Number,
      name: String,
    },
  }], required: true },
  estimatedTime: Number,
  capacity: { type: Number, required: true },
  languages: { type: Array, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  subscribers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
},
{
  timestamps: true,
});

const Itinerary = mongoose.model('Itinerary', itinerarySchema);

module.exports = Itinerary;
