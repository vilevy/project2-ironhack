const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itinerarySchema = new Schema ({
  // dia, horarios/locais/preço, idioma, descritivo, owner, inscritos
  day: { type: Date, required: true },
  places: { type: [{
    time: String,
    place: String,
    price: String,
  }], required: true },
  estimatedTime: Number,
  capacity: { type: Number, required: true },
  languages: { type: Array, required: true },
  description: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  subscribers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
},
{
  timestamps: true,
});

const Itinerary = mongoose.model('Itinerary', itinerarySchema);

module.exports = Itinerary;
