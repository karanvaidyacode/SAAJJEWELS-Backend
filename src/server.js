// src/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");

const { connectDB } = require("../src/config/db"); // keep your existing connectDB

// routes (adjust paths if your routes are elsewhere)
const authRoutes = require("../src/routes/auth.routes");
const offersRoutes = require("../src/routes/offers.routes");
const userRoutes = require("../src/routes/user.routes");
const productRoutes = require("../src/routes/product.routes");
const orderRoutes = require("../src/routes/order.routes");
const customerRoutes = require("../src/routes/customer.routes");
const razorpayRoutes = require("../src/routes/razorpay.routes");
const contactRoutes = require("../src/routes/contact.routes");

async function createApp() {
  // Attempt DB connect but DO NOT exit on failure
  try {
    const dbResult = await connectDB();
    console.log("connectDB resolved:", dbResult ? "ok" : "no-result");
  } catch (err) {
    console.error("connectDB failed (continuing without exiting):", err && err.message ? err.message : err);
    // Important: do NOT call process.exit() here
  }

  const app = express();

  // request logger
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
  });

  // allow all origins for now (you requested open CORS)
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(passport.initialize());

  // mount routes
  app.use("/auth", authRoutes);
  app.use("/offers", offersRoutes);
  app.use("/api", userRoutes);
  app.use("/api", productRoutes);
  app.use("/api/admin/orders", orderRoutes);
  app.use("/api/admin/customers", customerRoutes);
  app.use("/api/razorpay", razorpayRoutes);
  app.use("/api/contact", contactRoutes);

  // healthcheck
  app.get("/", (req, res) => res.json({ status: "ok" }));

  // error handler
  app.use((err, req, res, next) => {
    console.error("Unhandled error:", err && (err.stack || err));
    res.status(err && err.status ? err.status : 500).json({ error: err && err.message ? err.message : "Internal Server Error" });
  });

  return app;
}

// local/dev runnable
if (require.main === module) {
  (async () => {
    try {
      const app = await createApp();
      const PORT = process.env.PORT || 3002;
      app.listen(PORT, "0.0.0.0", () => console.log(`Server running on 0.0.0.0:${PORT}`));
    } catch (err) {
      console.error("Failed to start server (dev):", err);
      process.exit(1);
    }
  })();
}

module.exports = createApp;
