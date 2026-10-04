const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Invalid email address.' });
    if (!/^\d{10}$/.test(phone)) return res.status(400).json({ message: 'Phone must be 10 digits.' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });

    if (await User.findOne({ email: email.toLowerCase() })) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ name, email, phone, password: hashed }); // role defaults to "user"
    res.status(201).json({ message: 'Registration successful. Please log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server/database error. Try again later.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ email: email.toLowerCase() });
    // Same message for both cases so attackers cannot tell which one was wrong
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server/database error. Try again later.' });
  }
});

// GET /api/auth/profile
router.get('/profile', auth, (req, res) => {
  res.json(req.user); // password is already excluded by the auth middleware
});

module.exports = router;
