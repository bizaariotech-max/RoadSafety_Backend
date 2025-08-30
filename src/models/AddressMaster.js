const mongoose = require("mongoose");

const _AddressMaster = new mongoose.Schema(
    {
        AddressLine1: { type: String },
        AddressLine2: { type: String },
        CountryId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        StateId: { type: mongoose.SchemaTypes.ObjectId, ref: "admin_lookups" },
        CityId: { type: mongoose.SchemaTypes.ObjectId, ref: "admin_lookups" },
        PIN: { type: String },
        AddressTypeId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        AddressLabel: { type: String },
        IsCurrent: { type: Boolean },
        CreatedBy: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "asset_masters",
        },
        UpdatedBy: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "asset_masters",
        },
        geolocation: {
            type: { type: String, enum: ["Point"], default: "Point" },
            coordinates: { type: [Number], required: true }, // [longitude, latitude]
        },
        AssetId: { type: mongoose.SchemaTypes.ObjectId, ref: "asset_masters" },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("address_master", _AddressMaster);
