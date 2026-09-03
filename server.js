const express = require("express");
const cors = require("cors"); // Import cors
const connectDB = require("./config/db");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

// Middleware
// Configure CORS explicitly: when requests are sent with credentials
// (e.g. axios/fetch withCredentials), the wildcard origin "*" is not
// allowed by browsers, so we echo back the specific allowed origin.
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
// Increased body limit so larger JSON payloads (e.g. inline images) don't
// fail with 413 "request entity too large". Images should preferably be
// uploaded via POST /api/upload instead of embedding base64 in JSON.
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Serve uploaded files statically
app.use("/uploads", express.static(require("path").join(__dirname, "uploads")));

// Routes
app.use("/api", require("./routes/route"));

// Safer startup sequence
const startServer = async () => {
  try {
    await connectDB();
    app.listen(process.env.PORT, () => {
      console.log(`✅ Server running at : http://localhost:${process.env.PORT}`);
    });
  } catch (err) {
    console.error("❌ Error starting server:", err);
    process.exit(1);
  }
};

startServer();