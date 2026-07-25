const mongoose = require("mongoose");
async function connectToDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("conected to mongodb");
  } catch (error) {
    console.log("concetion failed ", error);
  }
}
module.exports = connectToDb;
