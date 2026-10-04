const express = require('express');
const path = require('path');
const fs = require('fs');
const Verification = require('../models/Verification');
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();
router.use(auth, admin); // every admin route needs login + admin role

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    res.json(await User.find().select('-password').sort({ createdAt: -1 }));
  } catch (err) {
    res.status(500).json({ message: 'Server/database error.' });
  }
});

// GET /api/admin/verifications
router.get('/verifications', async (req, res) => {
  try {
    const list = await Verification.find()
      .populate('userId', 'name email phone')
      .select('-documentPath')
      .sort({ submittedAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server/database error.' });
  }
});

// GET /api/admin/verification/:id/document  (admin-only file download)
router.get('/verification/:id/document', async (req, res) => {
  try {
    const v = await Verification.findById(req.params.id);
    if (!v) return res.status(404).json({ message: 'Request not found.' });
    const file = path.join(__dirname, '..', 'uploads', path.basename(v.documentPath));
    if (!fs.existsSync(file)) return res.status(404).json({ message: 'File missing on server.' });
    res.sendFile(file);
  } catch (err) {
    res.status(400).json({ message: 'Invalid request id.' });
  }
});

// Helper used by approve / reject / review
async function setStatus(req, res, status) {
  try {
    const v = await Verification.findById(req.params.id);
    if (!v) return res.status(404).json({ message: 'Request not found.' });
    v.status = status;
    v.adminRemarks = (req.body.remarks || '').toString().slice(0, 500);
    v.reviewedAt = new Date();
    await v.save();
    res.json({ message: `Verification marked as ${status}.` });
  } catch (err) {
    res.status(400).json({ message: 'Invalid request id.' });
  }
}

router.put('/verification/:id/approve', (req, res) => setStatus(req, res, 'Approved'));
router.put('/verification/:id/reject', (req, res) => setStatus(req, res, 'Rejected'));
router.put('/verification/:id/review', (req, res) => setStatus(req, res, 'Under Review'));

module.exports = router;
