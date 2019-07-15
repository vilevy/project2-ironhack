const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema ({
  role: { type: String, enum: ['guide', 'tourist'] },
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  birthDate: { type: Date, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  languages: { type: Array, required: true },
  interests: Array,
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
