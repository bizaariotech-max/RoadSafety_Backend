const express = require("express");
const { default: mongoose } = require("mongoose");
const router = express.Router();
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
  __CLIENT_SAVE_ERROR,
  __VALIDATION_ERROR,
  __DATA_404,
} = require("../../../utils/variable");

const StationMaster = require("../../../models/StationMaster");
const { __CreateAuditLog } = require("../../../utils/auditlog");
const {
  validateStationData,
  checkDuplicateStation,
} = require("../middleware/middleStation");

let APIEndPointNo = "";

// List Stations with filtering and pagination
router.post("/StationList", async (req, res) => {
  try {
    APIEndPointNo = "#KCC0101";
    const {
      page = 1,
      limit = 10,
      search = "",
      StationType,
      CityId,
      IsActive,
      ParentStationId
    } = req.body;

    const skip = (page - 1) * limit;
    let filter = {};

    // Search filter
    if (search && search.trim() !== "") {
      filter.$or = [
        { StationName: { $regex: search, $options: "i" } },
        { AddressLine1: { $regex: search, $options: "i" } },
        { AddressLine2: { $regex: search, $options: "i" } },
        { PostalCode: { $regex: search, $options: "i" } }
      ];
    }

    // Additional filters
    if (StationType) {
      filter.StationType = mongoose.Types.ObjectId(StationType);
    }
    if (CityId) {
      filter.CityId = mongoose.Types.ObjectId(CityId);
    }
    if (typeof IsActive === "boolean") {
      filter.IsActive = IsActive;
    }
    if (ParentStationId) {
      filter.ParentStationId = mongoose.Types.ObjectId(ParentStationId);
    }

    const [stations, totalCount] = await Promise.all([
      StationMaster.find(filter)
        .populate("ParentStationId", "StationName")
        .populate("StationType", "lookup_value")
        .populate("CityId", "lookup_value")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      StationMaster.countDocuments(filter)
    ]);

    if (!stations || stations.length === 0) {
      return res.json(__requestResponse("404", __RECORD_NOT_FOUND));
    }

    const responseData = {
      stations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalRecords: totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    };

    return res.json(__requestResponse("200", __SUCCESS, responseData));
  } catch (error) {
    console.log(`${APIEndPointNo} Error:`, error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
});

// Add new Station
router.post("/SaveStation", validateStationData, checkDuplicateStation, async (req, res) => {
  try {
    APIEndPointNo = "#KCC0102";
    const {
      ParentStationId,
      StationType,
      StationName,
      AddressLine1,
      AddressLine2,
      PostalCode,
      CityId,
      GeoLocation,
      IsActive = true
    } = req.validatedData;

    const stationData = {
      ParentStationId: ParentStationId && ParentStationId !== "" 
        ? mongoose.Types.ObjectId(ParentStationId) 
        : null,
      StationType: mongoose.Types.ObjectId(StationType),
      StationName,
      AddressLine1,
      AddressLine2: AddressLine2 || "",
      PostalCode,
      CityId: mongoose.Types.ObjectId(CityId),
      GeoLocation: GeoLocation || {
        type: "Point",
        coordinates: [0, 0]
      },
      IsActive
    };

    const newStation = await StationMaster.create(stationData);

    if (newStation) {
      // Create audit log for insert
      await __CreateAuditLog(
        "station_master",
        "INSERT",
        "NEW_STATION",
        null,
        JSON.stringify(newStation),
        newStation._id,
        null, // ClientId - you may need to get this from req.user or session
        null  // LoginLogId - you may need to get this from req.user or session
      );

      return res.json(
        __requestResponse("200", "Station created successfully", newStation)
      );
    } else {
      return res.json(__requestResponse("400", __CLIENT_SAVE_ERROR));
    }
  } catch (error) {
    console.log(`${APIEndPointNo} Error:`, error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
});

// Edit/Update Station
router.post("/UpdateStation", validateStationData, checkDuplicateStation, async (req, res) => {
  try {
    APIEndPointNo = "#KCC0103";
    const { station_id } = req.validatedData;

    if (!station_id || station_id === "") {
      return res.json(__requestResponse("400", "Station ID is required for update"));
    }

    const existingStation = await StationMaster.findById(station_id);
    if (!existingStation) {
      return res.json(__requestResponse("404", __RECORD_NOT_FOUND));
    }

    const {
      ParentStationId,
      StationType,
      StationName,
      AddressLine1,
      AddressLine2,
      PostalCode,
      CityId,
      GeoLocation,
      IsActive
    } = req.validatedData;

    const updateData = {
      ParentStationId: ParentStationId && ParentStationId !== "" 
        ? mongoose.Types.ObjectId(ParentStationId) 
        : null,
      StationType: mongoose.Types.ObjectId(StationType),
      StationName,
      AddressLine1,
      AddressLine2: AddressLine2 || "",
      PostalCode,
      CityId: mongoose.Types.ObjectId(CityId),
      IsActive: IsActive !== undefined ? IsActive : existingStation.IsActive
    };

    if (GeoLocation) {
      updateData.GeoLocation = GeoLocation;
    }

    const updatedStation = await StationMaster.findByIdAndUpdate(
      station_id,
      updateData,
      { new: true, runValidators: true }
    );

    if (updatedStation) {
      // Create audit log for update
      await __CreateAuditLog(
        "station_master",
        "UPDATE",
        "STATION_MODIFIED",
        JSON.stringify(existingStation),
        JSON.stringify(updatedStation),
        updatedStation._id,
        null, // ClientId
        null  // LoginLogId
      );

      return res.json(
        __requestResponse("200", "Station updated successfully", updatedStation)
      );
    } else {
      return res.json(__requestResponse("400", "Failed to update station"));
    }
  } catch (error) {
    console.log(`${APIEndPointNo} Error:`, error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
});

// Delete/Deactivate Station
router.post("/DeleteStation", async (req, res) => {
  try {
    APIEndPointNo = "#KCC0104";
    const { station_id } = req.body;

    if (!station_id || station_id === "") {
      return res.json(__requestResponse("400", "Station ID is required"));
    }

    const existingStation = await StationMaster.findById(station_id);
    if (!existingStation) {
      return res.json(__requestResponse("404", __RECORD_NOT_FOUND));
    }

    // Check if station has child stations
    const childStations = await StationMaster.find({ ParentStationId: station_id });
    if (childStations.length > 0) {
      return res.json(
        __requestResponse("400", "Cannot delete station with child stations. Please delete child stations first.")
      );
    }

    // Soft delete by setting IsActive to false
    const deletedStation = await StationMaster.findByIdAndUpdate(
      station_id,
      { IsActive: false },
      { new: true }
    );

    if (deletedStation) {
      // Create audit log for delete
      await __CreateAuditLog(
        "station_master",
        "DELETE",
        "STATION_DEACTIVATED",
        JSON.stringify(existingStation),
        JSON.stringify(deletedStation),
        deletedStation._id,
        null, // ClientId
        null  // LoginLogId
      );

      return res.json(
        __requestResponse("200", "Station deactivated successfully", deletedStation)
      );
    } else {
      return res.json(__requestResponse("400", "Failed to deactivate station"));
    }
  } catch (error) {
    console.log(`${APIEndPointNo} Error:`, error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
});

// Get Station by ID
router.post("/GetStation", async (req, res) => {
  try {
    APIEndPointNo = "#KCC0105";
    const { station_id } = req.body;

    if (!station_id || station_id === "") {
      return res.json(__requestResponse("400", "Station ID is required"));
    }

    const station = await StationMaster.findById(station_id)
      .populate("ParentStationId", "StationName")
      .populate("StationType", "lookup_value")
      .populate("CityId", "lookup_value");

    if (!station) {
      return res.json(__requestResponse("404", __RECORD_NOT_FOUND));
    }

    return res.json(__requestResponse("200", __SUCCESS, station));
  } catch (error) {
    console.log(`${APIEndPointNo} Error:`, error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
});

module.exports = router;