const mongoose = require("mongoose");

const mongoURl = process.env.DATABASE;

const __connectToMongo = async () => {
  mongoose.set("strictQuery", true);
  await mongoose
    .connect(mongoURl, {
      useNewUrlParser: true,
      user: process.env.DB_USER,
      pass: process.env.DB_PASSWORD,
      keepAlive: true,
      serverSelectionTimeoutMS: 5000,
    })
    .then((x) => console.log("Connected to database:" + x.connections[0].name))
    .catch((err) => console.log("DB Connect:", err));
};

module.exports = { __connectToMongo };
