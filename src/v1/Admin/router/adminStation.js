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

    // Handle both req.body and req.query to support GET and POST requests
    const requestData = req.body || req.query || {};
    const {
      page = 1,
      limit = 10,
      search = "",
      StationTypeId,
      CityId,
      IsActive,
      ParentStationId,
    } = requestData;

    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { StationName: { $regex: search, $options: "i" } },
        { AddressLine1: { $regex: search, $options: "i" } },
        { AddressLine2: { $regex: search, $options: "i" } },
        { PostalCode: { $regex: search, $options: "i" } },
      ];
    }

    // Station Type filter
    if (StationTypeId) {
      query.StationTypeId = StationTypeId;
    }

    // City filter
    if (CityId) {
      query.CityId = CityId;
    }

    // Active status filter
    if (typeof IsActive === "boolean" || IsActive !== undefined) {
      query.IsActive = IsActive;
    }

    // Parent Station filter
    if (ParentStationId) {
      query.ParentStationId = ParentStationId;
    }

    const total = await StationMaster.countDocuments(query);
    const list = await StationMaster.find(query)
      .populate("ParentStationId", "StationName")
      .populate("StationTypeId", "lookup_value")
      .populate("CityId", "lookup_value")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total,
        page: Number(page),
        limit: Number(limit),
        filters: {
          search,
          StationTypeId,
          CityId,
          IsActive,
          ParentStationId,
        },
        list: __deepClone(list),
      })
    );
  } catch (error) {
    console.error("Station List Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
});

router.post("/StationList-old", async (req, res) => {
  try {
    APIEndPointNo = "#KCC0101";
    const {
      page = 1,
      limit = 10,
      search = "",
      StationTypeId,
      CityId,
      IsActive,
      ParentStationId,
    } = req.body;

    const skip = (page - 1) * limit;
    let filter = {};

    // Search filter
    if (search && search.trim() !== "") {
      filter.$or = [
        { StationName: { $regex: search, $options: "i" } },
        { AddressLine1: { $regex: search, $options: "i" } },
        { AddressLine2: { $regex: search, $options: "i" } },
        { PostalCode: { $regex: search, $options: "i" } },
      ];
    }

    // Additional filters
    if (StationTypeId) {
      filter.StationTypeId = mongoose.Types.ObjectId(StationTypeId);
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
        .populate("StationTypeId", "lookup_value")
        .populate("CityId", "lookup_value")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      StationMaster.countDocuments(filter),
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
        hasPrev: page > 1,
      },
    };

    return res.json(__requestResponse("200", __SUCCESS, responseData));
  } catch (error) {
    console.log(`${APIEndPointNo} Error:`, error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
});

// Add new Station
router.post(
  "/SaveStation",
  validateStationData,
  // checkDuplicateStation,
  async (req, res) => {
    try {
      APIEndPointNo = "#KCC0102";
      const {
        ParentStationId,
        StationTypeId,
        StationName,
        AddressLine1,
        AddressLine2,
        PostalCode,
        CityId,
        GeoLocation,
        IsActive = true,
      } = req.validatedData;

      const stationData = {
        ParentStationId:
          ParentStationId && ParentStationId !== ""
            ? mongoose.Types.ObjectId(ParentStationId)
            : null,
        StationTypeId: mongoose.Types.ObjectId(StationTypeId),
        StationName,
        AddressLine1,
        AddressLine2: AddressLine2 || "",
        PostalCode,
        CityId: mongoose.Types.ObjectId(CityId),
        GeoLocation: GeoLocation || {
          type: "Point",
          coordinates: [0, 0],
        },
        IsActive,
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
          null // LoginLogId - you may need to get this from req.user or session
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
  }
);

// Edit/Update Station
router.post(
  "/UpdateStation",
  validateStationData,
  checkDuplicateStation,
  async (req, res) => {
    try {
      APIEndPointNo = "#KCC0103";
      const { _id } = req.validatedData;

      if (!_id || _id === "") {
        return res.json(
          __requestResponse("400", "Station ID is required for update")
        );
      }

      const existingStation = await StationMaster.findById(_id);
      if (!existingStation) {
        return res.json(__requestResponse("404", __RECORD_NOT_FOUND));
      }

      const {
        ParentStationId,
        StationTypeId,
        StationName,
        AddressLine1,
        AddressLine2,
        PostalCode,
        CityId,
        GeoLocation,
        IsActive,
      } = req.validatedData;

      const updateData = {
        ParentStationId:
          ParentStationId && ParentStationId !== ""
            ? mongoose.Types.ObjectId(ParentStationId)
            : null,
        StationTypeId: mongoose.Types.ObjectId(StationTypeId),
        StationName,
        AddressLine1,
        AddressLine2: AddressLine2 || "",
        PostalCode,
        CityId: mongoose.Types.ObjectId(CityId),
        IsActive: IsActive !== undefined ? IsActive : existingStation.IsActive,
      };

      if (GeoLocation) {
        updateData.GeoLocation = GeoLocation;
      }

      const updatedStation = await StationMaster.findByIdAndUpdate(
        _id,
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
          null // LoginLogId
        );

        return res.json(
          __requestResponse(
            "200",
            "Station updated successfully",
            updatedStation
          )
        );
      } else {
        return res.json(__requestResponse("400", "Failed to update station"));
      }
    } catch (error) {
      console.log(`${APIEndPointNo} Error:`, error.message);
      return res.json(__requestResponse("500", __SOME_ERROR));
    }
  }
);

// Delete/Deactivate Station
router.post("/DeleteStation", async (req, res) => {
  try {
    APIEndPointNo = "#KCC0104";
    const { _id } = req.body;

    if (!_id || _id === "") {
      return res.json(__requestResponse("400", "Station ID is required"));
    }

    const existingStation = await StationMaster.findById(_id);
    if (!existingStation) {
      return res.json(__requestResponse("404", __RECORD_NOT_FOUND));
    }

    // Check if station has child stations
    const childStations = await StationMaster.find({
      ParentStationId: _id,
    });
    if (childStations.length > 0) {
      return res.json(
        __requestResponse(
          "400",
          "Cannot delete station with child stations. Please delete child stations first."
        )
      );
    }

    // Soft delete by setting IsActive to false
    const deletedStation = await StationMaster.findByIdAndUpdate(
      _id,
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
        null // LoginLogId
      );

      return res.json(
        __requestResponse(
          "200",
          "Station deactivated successfully",
          deletedStation
        )
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
    const { _id } = req.body;

    if (!_id || _id === "") {
      return res.json(__requestResponse("400", "Station ID is required"));
    }

    const station = await StationMaster.findById(_id)
      .populate("ParentStationId", "StationName")
      .populate("StationTypeId", "lookup_value")
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
