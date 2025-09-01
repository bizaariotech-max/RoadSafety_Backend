const { default: mongoose } = require("mongoose");
const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");
const {
  __VALIDATION_ERROR,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const StationMaster = require("../../../models/StationMaster");
const _lookup = require("../../../models/lookupmodel");

// Validation schema for Station Master
const stationValidationSchema = Joi.object({
  _id: Joi.string().optional().allow(null, ""),
  ParentStationId: Joi.string().optional().allow(null, ""),
  StationTypeId: Joi.string().required(),
  StationName: Joi.string().required().min(2).max(100),
  AddressLine1: Joi.string().required().min(5).max(200),
  AddressLine2: Joi.string().optional().allow("").max(200),
  PostalCode: Joi.string()
    .required()
    .pattern(/^[0-9]{6}$/),
  CityId: Joi.string().required(),
  GeoLocation: Joi.object({
    type: Joi.string().valid("Point").default("Point"),
    coordinates: Joi.array().items(Joi.number()).length(2).required(),
  }).optional(),
  IsActive: Joi.boolean().default(true),
});

const validateStationData = async (req, res, next) => {
  try {
    const { error, value } = stationValidationSchema.validate(req.body);

    if (error) {
      return res.json(
        __requestResponse(
          "400",
          `${__VALIDATION_ERROR}: ${error.details[0].message}`
        )
      );
    }

    // Validate StationTypeId exists in lookups
    if (value.StationTypeId) {
      const StationTypeId = await _lookup.findById(value.StationTypeId);
      if (!StationTypeId || StationTypeId.lookup_type !== "station_type") {
        return res.json(
          __requestResponse("400", "Invalid Station Type selected")
        );
      }
    }

    // Validate CityId exists in lookups
    if (value.CityId) {
      const city = await _lookup.findById(value.CityId);
      if (!city || city.lookup_type !== "city") {
        return res.json(__requestResponse("400", "Invalid City selected"));
      }
    }

    // Validate ParentStationId if provided
    if (value.ParentStationId && value.ParentStationId !== "") {
      const parentStation = await StationMaster.findById(value.ParentStationId);
      if (!parentStation) {
        return res.json(
          __requestResponse("400", "Invalid Parent Station selected")
        );
      }
    }

    req.validatedData = value;
    next();
  } catch (error) {
    console.log("Validation Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
};

const checkDuplicateStation = async (req, res, next) => {
  try {
    const { _id, StationName, AddressLine1, PostalCode } = req.validatedData;

    const duplicateQuery = {
      $or: [
        { StationName: { $regex: new RegExp(`^${StationName}$`, "i") } },
        {
          AddressLine1: { $regex: new RegExp(`^${AddressLine1}$`, "i") },
          PostalCode: PostalCode,
        },
      ],
    };

    // Exclude current station if editing
    if (_id && _id !== "") {
      duplicateQuery._id = { $ne: mongoose.Types.ObjectId(_id) };
    }

    const existingStation = await StationMaster.findOne(duplicateQuery);

    if (existingStation) {
      return res.json(
        __requestResponse(
          "400",
          "Station with same name or address already exists"
        )
      );
    }

    next();
  } catch (error) {
    console.log("Duplicate Check Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
};

module.exports = {
  validateStationData,
  checkDuplicateStation,
};