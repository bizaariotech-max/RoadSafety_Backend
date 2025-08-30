const mongoose = require("mongoose");

const _assetMetaData = new mongoose.Schema(
  {
    AssetId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "asset_master",
    },
    DataTypeId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
    },
    MetaDataValue: {
      type: String,
    },
    IsActive: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("asset_meta_data", _assetMetaData);
