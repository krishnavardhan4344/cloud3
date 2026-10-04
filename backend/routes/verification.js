const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const Verification = require('../models/Verification');
const auth = require('../middleware/auth');

const router = express.Router();
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// --- Multer setup: random file names, allowed types, 5 MB limit ---
const ALLOWED = ['.pdf', '.jpg', '.jpeg', '.png'];
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, crypto.randomBytes(16).toString('hex') + ext); // never trust the user's file name
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const okMime = ['application/pdf', 'image/jpeg', 'image/png'].includes(file.mimetype);
    if (ALLOWED.includes(ext) && okMime) return cb(null, true);
    cb(new Error('INVALID_TYPE'));
  }
}).single('document');

// POST /api/verification/submit
router.post('/submit', auth, (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'File too large. Maximum size is 5 MB.' });
      if (err.message === 'INVALID_TYPE') return res.status(400).json({ message: 'Only PDF, JPG, JPEG and PNG files are allowed.' });
      return res.status(400).json({ message: 'File upload failed.' });
    }
    try {
      const { fullName, dateOfBirth, documentType, documentNumber } = req.body;
      if (!fullName || !dateOfBirth || !documentType || !documentNumber || !req.file) {
        if (req.file) fs.unlink(req.file.path, () => {}); // remove orphan file
        return res.status(400).json({ message: 'All fields and a document file are required.' });
      }
      const v = await Verification.create({
        userId: req.user._id, fullName, dateOfBirth, documentType, documentNumber,
        documentPath: req.file.filename
      });
      res.status(201).json({ message: 'Verification submitted successfully.', id: v._id });
    } catch (e) {
      if (req.file) fs.unlink(req.file.path, () => {});
      if (e.name === 'ValidationError') return res.status(400).json({ message: 'Invalid data submitted.' });
      console.error(e);
      res.status(500).json({ message: 'Server/database error. Try again later.' });
    }
  });
});

// GET /api/verification/status  (the logged-in user's own requests)
router.get('/status', auth, async (req, res) => {
  try {
    const list = await Verification.find({ userId: req.user._id })
      .select('-documentPath') // don't expose server file names
      .sort({ submittedAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server/database error. Try again later.' });
  }
});

module.exports = router;
