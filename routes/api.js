/**
 * routes/api.js  —  Express REST API routes
 *
 * MIGRATION NOTES:
 *   The old project used `next-routes` to handle BOTH page routing AND
 *   Express API routes from a single routes.js file. That package is
 *   dead (last release 2018, only supports React 15/16).
 *
 *   In Next.js 14:
 *   - PAGE routing is handled automatically by the /pages directory.
 *     File = route. No extra config needed.
 *     e.g. pages/dashboard.js  → /dashboard
 *          pages/election/[id].js → /election/:id  (dynamic)
 *
 *   - API routes go here (Express), mounted at /api in server.js
 *     e.g. POST /api/candidate/register
 *          POST /api/voter/register
 *          POST /api/voter/login
 *
 *   Link between pages now uses Next.js <Link> component — no Router.pushRoute().
 *   Programmatic navigation uses Next.js useRouter().push('/path').
 */

const express           = require('express');
const router            = express.Router();
const candidateCtrl     = require('../controllers/candidate');
const voterCtrl         = require('../controllers/voter');

// ── Candidate routes ───────────────────────────────────────────────────────
// Called by the election authority when adding a candidate.
// Sends a registration confirmation email.
router.post('/candidate/register', candidateCtrl.register);

// Called after election ends to notify participants of the winner.
router.post('/candidate/notify-winner', candidateCtrl.notifyWinner);

// ── Voter routes ───────────────────────────────────────────────────────────
// Called by the election authority when adding a voter.
// Hashes password and emails credentials.
router.post('/voter/register', voterCtrl.register);

// ── Health check ───────────────────────────────────────────────────────────
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
