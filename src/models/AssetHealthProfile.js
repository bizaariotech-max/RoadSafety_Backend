const mongoose = require("mongoose");

const _AssetHP = new mongoose.Schema(
  {
    HPCode: { type: String },
    AssetID: { type: mongoose.SchemaTypes.ObjectId, ref: "asset_master" },
    CategoryType: [
      { type: mongoose.SchemaTypes.ObjectId, ref: "admin_lookup" },
    ],
    CategoryGroup: {
      type: String,
      enum: ["PHYSICAL_FITNESS", "MENTAL_FITNESS"],
      required: true,
    },
    LastUpdated: { type: Date, default: new Date() },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to handle condition during creation
_AssetHP.pre("save", async function (next) {
  try {
    // Check CategoryType length based on CategoryGroup
    // if (
    //   this.CategoryGroup === "PHYSICAL_FITNESS" &&
    //   this.CategoryType.length < 7
    // ) {
    //   return next(
    //     new Error("CategoryType length must be at least 7 for PHYSICAL_FITNESS")
    //   );
    // }

    // if (
    //   this.CategoryGroup === "MENTAL_FITNESS" &&
    //   this.CategoryType.length < 5
    // ) {
    //   return next(
    //     new Error("CategoryType length must be at least 5 for MENTAL_FITNESS")
    //   );
    // }

    // Check if there is an existing profile with the same AssetID and CategoryGroup
    const existingProfile = await mongoose
      .model("asset_health_profiles")
      .findOne({
        AssetID: this.AssetID,
        CategoryGroup: this.CategoryGroup, // Match by CategoryGroup and AssetID
      });

    // If an existing profile is found, update it with the new CategoryType and other fields
    if (existingProfile) {
      existingProfile.CategoryType = this.CategoryType;
      existingProfile.LastUpdated = new Date(); // Update the last updated date
      existingProfile.CategoryGroup = this.CategoryGroup; // Ensure CategoryGroup is updated

      // Save the updated document
      await existingProfile.save();

      // Prevent the creation of a new document, instead updating the existing one
      return next(new Error("Document updated instead of creating a new one."));
    }

    // If HPCode is not set, generate it based on the count of documents
    if (!this.HPCode) {
      const Documents = mongoose.model("asset_health_profiles", _AssetHP);
      const count = await Documents.countDocuments();
      this.HPCode = `HP${("0000" + (count + 1)).slice(-5)}`;
    }

    // Proceed with saving the new document
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("asset_health_profiles", _AssetHP);
