/**
 * controllers/candidate.js
 *
 * MIGRATION NOTES:
 *   - bcrypt → bcryptjs (pure JS, no native build issues on Node 20)
 *   - Nodemailer sendMail converted to async/await (still backward compatible)
 *   - Added proper error handling so response isn't sent twice
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

// ── Reusable transporter (created once, not on every request) ─────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD, // Use a Gmail App Password (not your real password)
  },
});

module.exports = {
  /**
   * Send a registration confirmation email to a candidate.
   * Called when the election authority adds a candidate.
   */
  register: async function (req, res) {
    const { email, election_name } = req.body;

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: `${election_name} — Candidate Registration`,
      html: `
        <h2>Congratulations!</h2>
        <p>You have been successfully registered as a candidate for the
           <strong>${election_name}</strong> election.</p>
        <p>Please ensure your MetaMask wallet is set up before the election begins.</p>
      `,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Candidate registration email sent:', info.messageId);
      return res.json({
        status: 'success',
        message: 'Registration email sent successfully.',
        data: null,
      });
    } catch (err) {
      console.error('Mail error:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to send registration email.',
        data: null,
      });
    }
  },

  /**
   * Send a winner notification email to a candidate or voter.
   */
  notifyWinner: async function (req, res) {
    const { email, election_name, winner_name } = req.body;

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: `${election_name} — Election Results`,
      html: `
        <h2>Election Results for ${election_name}</h2>
        <p>The winner of the election is: <strong>${winner_name}</strong>.</p>
        <p>Thank you for participating.</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      return res.json({
        status: 'success',
        message: 'Winner notification email sent.',
        data: null,
      });
    } catch (err) {
      console.error('Mail error:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to send winner notification email.',
        data: null,
      });
    }
  },
};
