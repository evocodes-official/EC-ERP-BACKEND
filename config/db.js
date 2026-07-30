const mongoose = require("mongoose");

const connectDB = async () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(console.log("Connect to MongoDB"))
    .catch((err) => {
      console.log("Error in connecting to DB: ", err);
    });
};

module.exports = connectDB