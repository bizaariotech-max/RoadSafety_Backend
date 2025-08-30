const mongoose = require("mongoose");

const _LoginLog = new mongoose.Schema({
  UserId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "asset_master",
  },
  LoginTimeStamp: {
    type: mongoose.SchemaTypes.Date,
  },
  LoginToken: {
    type: String,
  },
  IsLoggedOut: { type: Boolean },
  LogoutTimeStamp: {
    type: mongoose.SchemaTypes.Date,
  },
  SourceIPAddress: {
    type: String,
  },
  DeviceName: {
    type: String,
  },
});

module.exports = mongoose.model("login_log", _LoginLog);
