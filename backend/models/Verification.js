const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true, trim: true },
  dateOfBirth: { type: Date, required: true },
  documentType: { type: String, enum: ['Aadhaar', 'Passport', 'Driving License', 'Voter ID'], required: true },
  documentNumber: { type: String, required: true, trim: true },
  documentPath: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Under Review', 'Approved', 'Rejected'], default: 'Pending' },
  adminRemarks: { type: String, default: '' },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date }
});

module.exports = mongoose.model('Verification', verificationSchema);
