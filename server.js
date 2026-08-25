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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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