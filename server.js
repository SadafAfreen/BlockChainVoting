/**
 * server.js
 *
 * MIGRATION CHANGES:
 *  1. Removed duplicate mongoose.connect() — the project already has
 *     config/database.js for this. 
 *  2. next-routes removed — using native next().getRequestHandler().
 *  3. process.exit(1) on DB error removed — app keeps running if DB is down.
 *  4. Added mongoose.set('strictQuery', true) via database.js to suppress warning.
 */

require('dotenv').config();

require('./config/database');

const express    = require('express');
const next       = require('next');
const bodyParser = require('body-parser');
const apiRoutes  = require('./routes/api');

const dev    = process.env.NODE_ENV !== 'production';
const app    = next({ dev });
const handle = app.getRequestHandler();
const PORT   = process.env.PORT || 3000;
const authRoutes = require('./routes/auth');

app.prepare().then(() => {
  const server = express();

  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({ extended: true }));

  // Express API routes (company/voter auth, candidate registration, etc.)
  server.use('/api/auth', authRoutes);

  server.use('/api', apiRoutes);

  // Next.js handles all page routing via the /pages directory.
  server.all('*', (req, res) => handle(req, res));

  server.listen(PORT, err => {
    if (err) throw err;
    console.log(`Server running → http://localhost:${PORT}`);
    console.log(`Mode: ${dev ? 'development' : 'production'}`);
  });
});