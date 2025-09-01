const mongoose = require("mongoose");
// Asset Master for Drive Safe

// *Asset Master Table 
// Asset ID, Station ID, Asset Type, Parent Asset ID,
// If Asset Type = Individual 
// Asset Name, Gender, Date of birth, Date of Joining, Blood Group, Reporting Asset ID, Designation (Designation Maste), Department (Department Master), 
// If Asset Type = Vehicle
// Fleet ID (Fleet Master), Registration Number, Engine Number, Chassis Number, Model, Make, Manufacturer, Year, Color, Fuel Type (Fuel Type Master)

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

    // If Asset Type = Individual 
    AssetName: String,
    // PhoneNumber: String,
    // Email: String,
    // Password: String,
    Gender: { type: String, enum: ["Male", "Female", "Other"] },
    DOB: Date,
    DateOfJoining: Date,
    BloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    ReportingAssetID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "asset_master",
    },
    DesignationTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin_lookups",
    },
    DepartmentTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin_lookups",
    },

    // If Asset Type = Vehicle
    FleetTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin_lookups",
    },
    RegistrationNumber: String,
    EngineNumber: String,
    ChassisNumber: String,
    Model: String,
    Make: String,
    Manufacturer: String,
    Year: Number,
    Color: String,
    FuelTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin_lookups",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("asset_master", _assetschema);
