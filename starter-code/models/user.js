const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema ({
  name: { type: String, required: true },
  birthDate: { type: Date, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  languages: { type: Array, required: true },
  socialNetworks: Array,
  webpage: String,
  interest: Array,
  about: String,
  profileImg: { type: String, default: 'images/default-avatar.png' },
  itineraries: [{ type: Schema.Types.ObjectId, ref: 'Itinerary' }],
  reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
},
{
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
