const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const express = require("express");
const cors = require("cors");
const os = require("os");

const networkInterfaces = os.networkInterfaces();
console.log(networkInterfaces["Wi-Fi"]);

const { __connectToMongo } = require("./src/database/db");
__connectToMongo();

const app = express();
const port = process.env.PORT || 3001;
const host = process.env.HOST;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// All Routes
const { V1 } = require("./src/routeController");

// app.use("/api/v1/app", V1.APP_ROUTE);
app.use("/api/v1/admin", V1.ADMIN_ROUTE);
app.use("/api/v1/common", V1.COMMON_ROUTE);

app.get("/", (req, res) => {
  res.send("Hello, world!");
});
// Server
app.listen(port, () => {
  console.log(`Server running at http://${host}:${port}/`);
});
