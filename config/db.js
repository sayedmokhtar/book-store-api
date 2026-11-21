const mongoose = require("mongoose");
async function connectToDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("mongo bd connected successfully");
  } catch (error) {
    console.log("concetion failed ", error.message);
    throw error;
  }
}
module.exports = connectToDb;
