/**
 * ipfs.js  —  IPFS client helper
 *
 * MIGRATION NOTES:
 *   OLD: ipfs-api@26  (abandoned ~2019, incompatible with Node 20)
 *   NEW: kubo-rpc-client@4  (official successor, actively maintained)
 *
 * All methods are now async/await based — callbacks are gone.
 * Make sure your local IPFS daemon (Kubo) is running:
 *   ipfs daemon
 * Or use a hosted gateway such as Infura / Pinata (see .env example below).
 */

const { create } = require('kubo-rpc-client');

// Local IPFS node (default). Override with env vars for hosted nodes.
// For Infura: { host: 'ipfs.infura.io', port: 5001, protocol: 'https',
//               headers: { authorization: 'Basic ' + Buffer.from(PROJECT_ID + ':' + PROJECT_SECRET).toString('base64') } }
const ipfs = create({
  host: process.env.IPFS_HOST || 'localhost',
  port: process.env.IPFS_PORT || '5001',
  protocol: process.env.IPFS_PROTOCOL || 'http',
});

/**
 * Upload a buffer or file stream to IPFS.
 * @param {Buffer|Uint8Array} fileBuffer
 * @returns {Promise<string>} CID string
 *
 * OLD pattern:
 *   ipfs.files.add(buffer, (err, result) => { const hash = result[0].hash; });
 *
 * NEW pattern (this function):
 *   const cid = await uploadToIPFS(buffer);
 */
async function uploadToIPFS(fileBuffer) {
  const result = await ipfs.add(fileBuffer);
  return result.cid.toString();
}

/**
 * Retrieve a file from IPFS by CID.
 * @param {string} cid
 * @returns {Promise<Buffer>}
 *
 * OLD pattern:
 *   ipfs.files.get(hash, callback)
 *
 * NEW pattern:
 *   const buffer = await getFromIPFS(cid);
 */
async function getFromIPFS(cid) {
  const chunks = [];
  for await (const chunk of ipfs.cat(cid)) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * Build a public gateway URL for displaying images stored on IPFS.
 * Uses the local gateway by default; swap for a public one in production.
 * @param {string} cid
 * @returns {string}
 */
function ipfsGatewayUrl(cid) {
  const gateway = process.env.IPFS_GATEWAY || 'http://localhost:8080';
  return `${gateway}/ipfs/${cid}`;
}

module.exports = { ipfs, uploadToIPFS, getFromIPFS, ipfsGatewayUrl };
