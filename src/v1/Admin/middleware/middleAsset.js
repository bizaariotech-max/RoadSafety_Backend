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


// Helper function for ObjectId validation - new
const objectIdField = (isRequired = false) => {
  let schema = Joi.string().custom((value, helpers) => {
    // Convert empty string to null to prevent MongoDB cast errors
    if (value === "") {
      return null;
    }
    if (value && !mongoose.Types.ObjectId.isValid(value)) {
      return helpers.error("any.invalid");
    }
    return value;
  }).empty(''); // This converts empty strings to undefined/null

  if (isRequired) {
    return schema.required().messages({
      "any.required": "This field is required",
      "string.empty": "This field cannot be empty",
      "any.invalid": "Invalid ObjectId format",
    });
  } else {
    return schema.allow(null).optional();
  }
};

// Validation schema for Individual Asset
const individualAssetValidationSchema = Joi.object({
  asset_id: Joi.string().optional().allow(null, ""),
  AssetTypeId: Joi.string().required(),
  ParentAssetId: Joi.string().optional().allow(null, ""),
  AssetName: Joi.string().required().min(2).max(100),
  // PhoneNumber: Joi.string().required().pattern(/^[0-9]{10}$/),
  // Email: Joi.string().email().required(),
  // Password: Joi.string().min(6).max(50).when('asset_id', {
  //   is: Joi.exist().not(''),
  //   then: Joi.optional(),
  //   otherwise: Joi.required()
  // }),
  Gender: Joi.string().valid("Male", "Female", "Other").required(),
  DOB: Joi.date().optional().allow(null, ""),
  DateOfJoining: Joi.date().optional().allow(null, ""),
  BloodGroup: Joi.string()
    .valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-")
    .optional()
    .allow(null, ""),
  ReportingAssetID: Joi.string().optional().allow(null, ""),
  DesignationTypeId: Joi.string().optional().allow(null, ""),
  // DepartmentTypeId: Joi.string().optional().allow(null, ""),
  DepartmentTypeId: Joi.string().optional().allow(null).empty(""),
});

// Validation schema for Vehicle Asset
const vehicleAssetValidationSchema = Joi.object({
  asset_id: Joi.string().optional().allow(null, ""),
  AssetTypeId: Joi.string().required(),
  ParentAssetId: Joi.string().optional().allow(null, ""),
  // AssetName: Joi.string().required().min(2).max(100),
  FleetTypeId: Joi.string().required(),
  RegistrationNumber: Joi.string().required().min(3).max(20),
  EngineNumber: Joi.string().required().min(3).max(50),
  ChassisNumber: Joi.string().required().min(3).max(50),
  Model: Joi.string().required().min(2).max(50),
  Make: Joi.string().required().min(2).max(50),
  Manufacturer: Joi.string().required().min(2).max(50),
  Year: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear() + 1)
    .required(),
  Color: Joi.string().optional().allow(null, ""),
  FuelTypeId: Joi.string().optional().allow(null, ""),
});

const validateIndividualAssetData = async (req, res, next) => {
  try {
    const { error, value } = individualAssetValidationSchema.validate(req.body);

    if (error) {
      return res.json(
        __requestResponse(
          "400",
          `${__VALIDATION_ERROR}: ${error.details[0].message}`
        )
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

    // Validate DesignationTypeId
    if (value.DesignationTypeId) {
      const designation = await _lookup.findById(value.DesignationTypeId);
      if (!designation || designation.lookup_type !== "designation_type") {
        return res.json(
          __requestResponse("400", "Invalid Designation Type selected")
        );
      }
    }

    // Validate DepartmentTypeId
    if (value.DepartmentTypeId) {
      const department = await _lookup.findById(value.DepartmentTypeId);
      if (!department || department.lookup_type !== "department_type") {
        return res.json(
          __requestResponse("400", "Invalid Department Type selected")
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

    // Validate ReportingAssetID if provided
    if (value.ReportingAssetID && value.ReportingAssetID !== "") {
      const reportingAsset = await AssetMaster.findById(value.ReportingAssetID);
      if (!reportingAsset) {
        return res.json(
          __requestResponse("400", "Invalid Reporting Asset selected")
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
    console.log("Individual Asset Validation Error:", error.message);
    return res.json(
      // __requestResponse("500", __SOME_ERROR)
      __requestResponse("400", {
        errorType: "Validation Error",
        error: error?.details?.map((d) => d.message).join(". "),
      })
    );
  }
};

const validateVehicleAssetData = async (req, res, next) => {
  try {
    const { error, value } = vehicleAssetValidationSchema.validate(req.body);

    if (error) {
      return res.json(
        // __requestResponse("400", `${__VALIDATION_ERROR}: ${error.details[0].message}`)
        __requestResponse("400", {
          errorType: "Validation Error",
          error: error?.details?.map((d) => d.message).join(". "),
        })
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

    // Validate FleetTypeId
    if (value.FleetTypeId) {
      const fleetType = await _lookup.findById(value.FleetTypeId);
      if (!fleetType || fleetType.lookup_type !== "fleet_type") {
        return res.json(
          __requestResponse("400", "Invalid Fleet Type selected")
        );
      }
    }

    // Validate FuelTypeId
    if (value.FuelTypeId) {
      const fuelType = await _lookup.findById(value.FuelTypeId);
      if (!fuelType || fuelType.lookup_type !== "fuel_type") {
        return res.json(__requestResponse("400", "Invalid Fuel Type selected"));
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

    req.validatedData = value;
    next();
  } catch (error) {
    console.log("Vehicle Asset Validation Error:", error.message);
    return res.json(
      // __requestResponse("500", __SOME_ERROR)
      __requestResponse("400", {
        errorType: "Validation Error",
        error: error?.details?.map((d) => d.message).join(". "),
      })
    );
  }
};

const checkDuplicateIndividualAsset = async (req, res, next) => {
  try {
    const { asset_id, AssetName, PhoneNumber, Email } = req.validatedData;

    const duplicateQuery = {
      $or: [
        { AssetName: { $regex: new RegExp(`^${AssetName}$`, "i") } },
        { PhoneNumber: PhoneNumber },
        { Email: { $regex: new RegExp(`^${Email}$`, "i") } },
      ],
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
        __requestResponse("400", `${duplicateField} already exists`)
      );
    }

    next();
  } catch (error) {
    console.log("Duplicate Check Error:", error.message);
    return res.json(
      // __requestResponse("500", __SOME_ERROR)
      __requestResponse("400", {
        errorType: "Validation Error",
        error: error?.details?.map((d) => d.message).join(". "),
      })
    );
  }
};

const checkDuplicateVehicleAsset = async (req, res, next) => {
  try {
    const {
      asset_id,
      AssetName,
      RegistrationNumber,
      EngineNumber,
      ChassisNumber,
    } = req.validatedData;

    const duplicateQuery = {
      $or: [
        { AssetName: { $regex: new RegExp(`^${AssetName}$`, "i") } },
        {
          RegistrationNumber: {
            $regex: new RegExp(`^${RegistrationNumber}$`, "i"),
          },
        },
        { EngineNumber: { $regex: new RegExp(`^${EngineNumber}$`, "i") } },
        { ChassisNumber: { $regex: new RegExp(`^${ChassisNumber}$`, "i") } },
      ],
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
      } else if (
        existingAsset.RegistrationNumber.toLowerCase() ===
        RegistrationNumber.toLowerCase()
      ) {
        duplicateField = "Registration Number";
      } else if (
        existingAsset.EngineNumber.toLowerCase() === EngineNumber.toLowerCase()
      ) {
        duplicateField = "Engine Number";
      } else if (
        existingAsset.ChassisNumber.toLowerCase() ===
        ChassisNumber.toLowerCase()
      ) {
        duplicateField = "Chassis Number";
      }

      return res.json(
        __requestResponse("400", `${duplicateField} already exists`)
      );
    }

    next();
  } catch (error) {
    console.log("Duplicate Check Error:", error.message);
    return res.json(
      // __requestResponse("500", __SOME_ERROR)
      __requestResponse("400", {
        errorType: "Validation Error",
        error: error.details.map((d) => d.message).join(". "),
      })
    );
  }
};

module.exports = {
  validateIndividualAssetData,
  validateVehicleAssetData,
  checkDuplicateIndividualAsset,
  checkDuplicateVehicleAsset,
};
