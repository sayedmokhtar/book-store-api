const mongoose = require("mongoose");
async function connectToDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("mongo bd connected successfully");
    console.log("connected database", mongoose.connection.name);
  } catch (error) {
    console.log("concetion failed ", error.message);
    throw error;
  }
}
module.exports = connectToDb;
