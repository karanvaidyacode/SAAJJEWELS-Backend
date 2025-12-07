// api/index.js
const serverless = require("serverless-http");
const createApp = require("../src/server");

let initPromise = null;
let handler = null;

if (!initPromise) {
  initPromise = (async () => {
    try {
      const app = await createApp();
      handler = serverless(app);
      return handler;
    } catch (err) {
      console.error("Failed to init app for serverless:", err);
      throw err;
    }
  })();
}

module.exports = async (req, res) => {
  try {
    await initPromise;
    if (!handler) {
      res.statusCode = 500;
      res.end("Server initialization failed");
      return;
    }
    return handler(req, res);
  } catch (err) {
    console.error("Serverless handler error:", err);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
};
