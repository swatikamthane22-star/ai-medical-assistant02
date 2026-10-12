const mongoose = require('mongoose');
module.exports = mongoose.model('Prediction', new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  symptoms: [String],
  age: Number,
  gender: String,
  emergency: Boolean,
  engine: String,
  results: [{
    disease: String, probability: Number, severity: String, doctor: String,
    medicines: [String], precautions: [String],
  }],
}, { timestamps: true }));
