// app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const { connectDB } = require("./config/db");

const authRoutes = require("../src/routes/auth.routes");
const offersRoutes = require("../src/routes/offers.routes");
const userRoutes = require("../src/routes/user.routes");
const productRoutes = require("../src/routes/product.routes");
const orderRoutes = require("../src/routes/order.routes");
const customerRoutes = require("../src/routes/customer.routes");
const razorpayRoutes = require("../src/routes/razorpay.routes");
const contactRoutes = require("../src/routes/contact.routes");

async function createApp() {
  // Connect to PostgreSQL first
  const isConnected = await connectDB();
  if (!isConnected) {
    console.log("WARNING: PostgreSQL not available. Some features may be limited.");
    // don't exit - allow app to start but log warning (serverless environments shouldn't immediately exit)
  } else {
    console.log("SUCCESS: PostgreSQL connected successfully.");
  }

  const app = express();

  // Request logger for debugging
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  // CORS: allow all origins for now (you asked for this)
  const corsOptions = {
    origin: true, // allow all origins -- change later for security
    credentials: true,
  };

  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(passport.initialize());

  // Routes
  app.use("/auth", authRoutes);
  app.use("/offers", offersRoutes);
  app.use("/api", userRoutes);
  app.use("/api", productRoutes);
  app.use("/api/admin/orders", orderRoutes);
  app.use("/api/admin/customers", customerRoutes);
  app.use("/api/razorpay", razorpayRoutes);
  app.use("/api/contact", contactRoutes);

  // Health-check
  app.get("/", (req, res) => res.json({ status: "ok" }));

  // Error handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
  });

  return app;
}

// If started directly (local dev), start listening
if (require.main === module) {
  (async () => {
    try {
      const app = await createApp();
      const PORT = process.env.PORT || 3002;
      const server = app.listen(PORT, "0.0.0.0", () => console.log(`Server running on 0.0.0.0:${PORT}`));
      server.on("error", (err) => console.error("Server error:", err));
      server.on("listening", () => console.log("Server is listening"));
    } catch (err) {
      console.error("Failed to start app:", err);
      process.exit(1);
    }
  })();
}

// Export for serverless wrapper (Vercel)
module.exports = createApp;
