const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  role: { type: String, enum: ['guide', 'tourist'] },
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  birthDate: { type: { day: Number, month: Number, year: Number }, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  languages: { type: Array, required: true },
  interests: Array,
  about: String,
  profileImg: { type: String, default: 'images/default-avatar.png' },
  itineraries: [{ itinerary: { type: Schema.Types.ObjectId, ref: 'Itinerary' }, number: Number }],

  reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
},
{
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
