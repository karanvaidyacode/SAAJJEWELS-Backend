const serverless = require('serverless-http');
const createApp = require('../src/server');

let initPromise = null;
let handler = null;

if (!initPromise) {
  initPromise = (async () => {
    const app = await createApp();
    handler = serverless(app);
    return handler;
  })();
}

module.exports = async (req, res) => {
  try {
    await initPromise;
    if (!handler) return res.status(500).end('Server init failed');
    return handler(req, res);
  } catch (err) {
    console.error('SERVERLESS ERROR:', err);
    res.status(500).end('Internal Server Error');
  }
};
