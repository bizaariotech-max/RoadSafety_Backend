const mongoose = require("mongoose");

const _LoginMaster = new mongoose.Schema(
  {
    AssetId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "asset_masters",
    },
    AssetTypeId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
    },
    UserName: {
      type: String,
    },
    LoginId: {
      type: String,
    },
    Pwd: {
      type: String,
    },
    ParentAssetId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "asset_masters",
    },
    IsFirstLogin: {
      type: Boolean,
    },
    SecQues1: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
    },
    SecQues2: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
    },
    Ans1: { type: String },
    Ans2: { type: String },
    IsLocked: {
      type: Boolean,
    },
    IsDisabled: {
      type: Boolean,
    },
    MPIN: {
      type: String,
    },
    IsAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("login_master", _LoginMaster);
