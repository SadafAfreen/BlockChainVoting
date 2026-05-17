/**
 * routes/auth.js  —  Authentication + voter management routes
 *
 * FIXES IN THIS VERSION:
 *  1. voter-login: was matching on `username`, page sends `email` — fixed to email
 *  2. Company model: added electionAddress field (needed after election creation)
 *  3. company-login: now returns electionAddress so frontend can store it in cookie
 *  4. voter/register: moved here from controllers/voter.js for co-location with models
 *  5. voters/list: fixed POST method and response shape to match voting_list.js
 */

const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const mongoose = require('mongoose');

// ── Models ────────────────────────────────────────────────────────────────
// Guard against "Cannot overwrite model once compiled" error on hot-reload
const Company = mongoose.models.Company || mongoose.model('Company', new mongoose.Schema({
  email:           { type: String, required: true, unique: true },
  passwordHash:    { type: String, required: true },
  electionAddress: { type: String, default: '' },  // FIX: added — needed after election deploy
  electionName:    { type: String, default: '' },
}, { timestamps: true }));

const Voter = mongoose.models.Voter || mongoose.model('Voter', new mongoose.Schema({
  email:        { type: String, required: true },
  passwordHash: { type: String, required: true },
  companyEmail: { type: String, required: true },
  voted:        { type: Boolean, default: false },
}, { timestamps: true }));

// ── POST /api/auth/company-register ───────────────────────────────────────
router.post('/company-register', async (req, res) => {
  console.log('🔥 HIT company-register route');
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ status: 'error', message: 'Email and password required.' });

  try {
    const existing = await Company.findOne({ email });
    if (existing)
      return res.status(409).json({ status: 'error', message: 'Email already registered.' });

    const passwordHash = await bcrypt.hash(password, 10);
    const company = await Company.create({ email, passwordHash });
    return res.json({ status: 'success', message: 'Registered successfully.', data: { email: company.email } });
  } catch (err) {
    console.error('company-register error:', err);
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
});

// ── POST /api/auth/company-login ───────────────────────────────────────────
router.post('/company-login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ status: 'error', message: 'Email and password required.' });

  try {
    const company = await Company.findOne({ email });
    if (!company)
      return res.status(401).json({ status: 'error', message: 'Company not found.' });

    const match = await bcrypt.compare(password, company.passwordHash);
    if (!match)
      return res.status(401).json({ status: 'error', message: 'Incorrect password.' });

    // FIX: return electionAddress + id so frontend can set cookies correctly
    return res.json({
      status: 'success',
      data: {
        id:              company._id.toString(),
        email:           company.email,
        electionAddress: company.electionAddress || '',
      }
    });
  } catch (err) {
    console.error('company-login error:', err);
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
});

// ── POST /api/auth/voter-login ─────────────────────────────────────────────
router.post('/voter-login', async (req, res) => {
  // FIX: was matching on `username` — voter_login.js sends `email`
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ status: 'error', message: 'Email and password required.' });

  try {
    const voter = await Voter.findOne({ email });
    if (!voter)
      return res.status(401).json({ status: 'error', message: 'Voter not found.' });

    const match = await bcrypt.compare(password, voter.passwordHash);
    if (!match)
      return res.status(401).json({ status: 'error', message: 'Incorrect password.' });

    // Get election address from the company that registered this voter
    const company = await Company.findOne({ email: voter.companyEmail });
    return res.json({
      status: 'success',
      data: {
        email:           voter.email,
        election_address: company?.electionAddress || '',
      }
    });
  } catch (err) {
    console.error('voter-login error:', err);
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
});

// ── POST /api/voter/register ───────────────────────────────────────────────
// Called by voting_list.js when the company registers a new voter.
// Hashes the password and sends credentials by email via nodemailer.
router.post('/voter/register', async (req, res) => {
  const { email, election_address, election_name, election_description } = req.body;
  if (!email)
    return res.status(400).json({ status: 'error', message: 'Email is required.' });

  try {
    // Look up the company that owns this election address
    const company = await Company.findOne({ electionAddress: election_address });
    if (!company)
      return res.status(404).json({ status: 'error', message: 'Election not found.' });

    // Check if voter already registered
    const existing = await Voter.findOne({ email, companyEmail: company.email });
    if (existing)
      return res.status(409).json({ status: 'error', message: 'Voter already registered.' });

    // Generate a random password
    const rawPassword  = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    await Voter.create({ email, passwordHash, companyEmail: company.email });

    // Send credentials email via nodemailer
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL, pass: process.env.PASSWORD },
    });
    await transporter.sendMail({
      from: process.env.EMAIL,
      to:   email,
      subject: `${election_name} — Your Voter Credentials`,
      html: `
        <h2>You have been registered as a voter!</h2>
        <p>Election: <strong>${election_name}</strong></p>
        <p>Your login credentials:</p>
        <ul>
          <li>Email: <strong>${email}</strong></li>
          <li>Password: <strong>${rawPassword}</strong></li>
        </ul>
        <p>Please keep these safe and do not share them.</p>
      `,
    });

    return res.json({ status: 'success', message: 'Voter registered and credentials emailed.' });
  } catch (err) {
    console.error('voter/register error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to register voter.' });
  }
});

// ── POST /api/voters/list ─────────────────────────────────────────────────
// Used by voting_list.js to load the voter list for this election
router.post('/voters/list', async (req, res) => {
  const { election_address } = req.body;
  try {
    const company = await Company.findOne({ electionAddress: election_address });
    if (!company)
      return res.json({ status: 'success', data: { voters: [] }, count: 0 });

    const voters = await Voter.find({ companyEmail: company.email }, '-passwordHash');
    return res.json({
      status: 'success',
      count: voters.length,
      data: {
        voters: voters.map(v => ({ id: v._id.toString(), email: v.email, voted: v.voted }))
      }
    });
  } catch (err) {
    console.error('voters/list error:', err);
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
});

// ── POST /api/auth/save-election-address ──────────────────────────────────
// Called after a company deploys an election contract.
// Saves the deployed address to the Company record in MongoDB.
router.post('/save-election-address', async (req, res) => {
  const { email, electionAddress, electionName } = req.body;
  try {
    await Company.findOneAndUpdate(
      { email },
      { electionAddress, electionName },
      { new: true }
    );
    return res.json({ status: 'success', message: 'Election address saved.' });
  } catch (err) {
    console.error('save-election-address error:', err);
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
});

module.exports = router;
module.exports.Company = Company;
module.exports.Voter   = Voter;