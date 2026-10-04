// Connects to MongoDB and creates the default admin account if missing
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');

  const email = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const exists = await User.findOne({ email });
  if (!exists) {
    const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 10);
    await User.create({ name: 'Administrator', email, phone: '0000000000', password: hashed, role: 'admin' });
    console.log('Default admin created:', email);
  }
}

module.exports = connectDB;
