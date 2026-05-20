/**
 * controllers/voter.js
 *
 * MIGRATION NOTES:
 *   - bcrypt → bcryptjs (drop-in replacement, identical API)
 *   - All async operations use async/await
 *   - Added error handling guards
 */

require('dotenv').config();
const bcrypt     = require('bcryptjs');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

module.exports = {
  /**
   * Register a voter: hash their password and send credentials by email.
   * Called when the election authority adds a voter.
   *
   * USAGE IN ROUTE:
   *   router.post('/voter/register', voterController.register);
   */
  register: async function (req, res) {
    const { email, username, password, election_name } = req.body;

    try {
      // bcryptjs.hash is identical to bcrypt.hash — no code change needed
      const hashedPassword = await bcrypt.hash(password, 10);

      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: `${election_name} — Voter Registration`,
        html: `
          <h2>You have been registered as a voter!</h2>
          <p>Election: <strong>${election_name}</strong></p>
          <p>Your login credentials:</p>
          <ul>
            <li>Username: <strong>${username}</strong></li>
            <li>Password: <strong>${password}</strong></li>
          </ul>
          <p>Please keep these credentials safe and do not share them.</p>
        `,
      };

      await transporter.sendMail(mailOptions);

      return res.json({
        status: 'success',
        message: 'Voter registered and credentials emailed.',
        data: { hashedPassword },
      });
    } catch (err) {
      console.error('Voter registration error:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Voter registration failed.',
        data: null,
      });
    }
  },

  /**
   * Verify a voter's password during login.
   * bcryptjs.compare is identical to bcrypt.compare.
   */
  verifyPassword: async function (plainText, hashedPassword) {
    return bcrypt.compare(plainText, hashedPassword);
  },
};
