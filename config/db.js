const mongoose = require("mongoose");
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const config = require("./jwt");
const path = require("path");

const connectDB = async () => {
  const uri = config.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  const options = {
    maxPoolSize: 10,
    minPoolSize: 2,
    // Atlas connections need to complete TLS + SRV discovery + replica-set
    // handshake; 5s was too short on this network, causing
    // MongooseServerSelectionError: Server selection timed out after 5000 ms.
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    family: 4,
    bufferCommands: false,
  };

  try {
    const conn = await mongoose.connect(uri, options);

    mongoose.connection.on("connected", () => {
      console.log(`MongoDB connected: ${conn.connection.host}`);
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });

    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed due to app termination");
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

module.exports = connectDB;