const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", require("./routes/route"));

const startServer = async () => {
  await connectDB();
  app.listen(process.env.PORT, () => {
    console.log(
      "✅ Server being at : " + `http://locahost:${process.env.PORT}`);
  });
};
try {
  startServer();
} catch (err) {
  console.log("Error: ", err);
}
