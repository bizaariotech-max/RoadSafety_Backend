const mongoose = require("mongoose");
// Asset Master for Drive Safe

const _assetschema = new mongoose.Schema(
  {
    AssetTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin_lookups",
    },
    ParentAssetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "asset_master",
    },
    AssetName: String,
    PhoneNumber: String,
    Email: String,
    Password: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("asset_master", _assetschema);
