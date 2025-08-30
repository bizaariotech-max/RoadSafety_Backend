const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 8080;
const host = process.env.HOST;
const { __connectToMongo } = require("./src/database/db");
__connectToMongo();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const { V1 } = require("./src/routeController");

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

// app.use("/api/v1/app", V1.APP_ROUTE);
app.use("/api/v1/admin", V1.ADMIN_ROUTE);
app.use("/api/v1/common", V1.COMMON_ROUTE);

app.listen(port, () => {
    console.log(`Server running at https://${host}:${port}/`);
});
