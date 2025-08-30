const { default: mongoose } = require("mongoose");
const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");
const {
  __VALIDATION_ERROR,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const AssetMaster = require("../../../models/AssetMaster");
const _lookup = require("../../../models/lookupmodel");
const bcrypt = require("bcrypt");

// Validation schema for Asset Master
const assetValidationSchema = Joi.object({
  asset_id: Joi.string().optional().allow(""),
  AssetTypeId: Joi.string().required(),
  ParentAssetId: Joi.string().optional().allow(null, ""),
  AssetName: Joi.string().required().min(2).max(100),
  PhoneNumber: Joi.string().required().pattern(/^[0-9]{10}$/),
  Email: Joi.string().email().required(),
  Password: Joi.string().min(6).max(50).when('asset_id', {
    is: Joi.exist().not(''),
    then: Joi.optional(),
    otherwise: Joi.required()
  }),
});

const validateAssetData = async (req, res, next) => {
  try {
    const { error, value } = assetValidationSchema.validate(req.body);
    
    if (error) {
      return res.json(
        __requestResponse("400", `${__VALIDATION_ERROR}: ${error.details[0].message}`)
      );
    }

    // Validate AssetTypeId exists in lookups
    if (value.AssetTypeId) {
      const assetType = await _lookup.findById(value.AssetTypeId);
      if (!assetType || assetType.lookup_type !== "asset_type") {
        return res.json(
          __requestResponse("400", "Invalid Asset Type selected")
        );
      }
    }

    // Validate ParentAssetId if provided
    if (value.ParentAssetId && value.ParentAssetId !== "") {
      const parentAsset = await AssetMaster.findById(value.ParentAssetId);
      if (!parentAsset) {
        return res.json(
          __requestResponse("400", "Invalid Parent Asset selected")
        );
      }
    }

    // Hash password if provided
    if (value.Password) {
      const saltRounds = 10;
      value.Password = await bcrypt.hash(value.Password, saltRounds);
    }

    req.validatedData = value;
    next();
  } catch (error) {
    console.log("Validation Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
};

const checkDuplicateAsset = async (req, res, next) => {
  try {
    const { asset_id, AssetName, PhoneNumber, Email } = req.validatedData;
    
    const duplicateQuery = {
      $or: [
        { AssetName: { $regex: new RegExp(`^${AssetName}$`, "i") } },
        { PhoneNumber: PhoneNumber },
        { Email: { $regex: new RegExp(`^${Email}$`, "i") } }
      ]
    };

    // Exclude current asset if editing
    if (asset_id && asset_id !== "") {
      duplicateQuery._id = { $ne: mongoose.Types.ObjectId(asset_id) };
    }

    const existingAsset = await AssetMaster.findOne(duplicateQuery);
    
    if (existingAsset) {
      let duplicateField = "";
      if (existingAsset.AssetName.toLowerCase() === AssetName.toLowerCase()) {
        duplicateField = "Asset Name";
      } else if (existingAsset.PhoneNumber === PhoneNumber) {
        duplicateField = "Phone Number";
      } else if (existingAsset.Email.toLowerCase() === Email.toLowerCase()) {
        duplicateField = "Email";
      }
      
      return res.json(
        __requestResponse("400", `Asset with same ${duplicateField} already exists`)
      );
    }

    next();
  } catch (error) {
    console.log("Duplicate Check Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
};

module.exports = {
  validateAssetData,
  checkDuplicateAsset,
};