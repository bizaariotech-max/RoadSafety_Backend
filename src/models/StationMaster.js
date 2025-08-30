const mongoose = require("mongoose");

const StationSchema = new mongoose.Schema(
  {
    ParentStationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "station_master",
      default: null,
    },
    StationTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin_lookups",
    },
    StationName: String,
    AddressLine1: String,
    AddressLine2: String,
    PostalCode: String,
    CityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin_lookups",
    },
    GeoLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number] }, // [lng, lat]
    },
    IsActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("station_master", StationSchema);
