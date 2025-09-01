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

const AssetMaster = require("../../../models/AssetMaster");
const { __CreateAuditLog } = require("../../../utils/auditlog");
const {
  validateIndividualAssetData,
  validateVehicleAssetData,
  checkDuplicateIndividualAsset,
  checkDuplicateVehicleAsset,
} = require("../middleware/middleAsset");

let APIEndPointNo = "";

// List Assets with filtering and pagination
router.post("/AssetList", async (req, res) => {
  try {
    APIEndPointNo = "#DSF0201";

    // Handle both req.body and req.query to support GET and POST requests
    const requestData = req.body || req.query || {};
    const {
      page = 1,
      limit = 10,
      search = "",
      // AssetCategoryLevel1,
      // AssetCategoryLevel2,
      // AssetCategoryLevel3,
      // StationId,
      // SubscriptionType,
      AssetTypeId,
      ParentAssetId,
    } = requestData;

    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { AssetName: { $regex: search, $options: "i" } },
        { RegistrationNumber: { $regex: search, $options: "i" } },
        { Model: { $regex: search, $options: "i" } },
        { Make: { $regex: search, $options: "i" } },
      ];
    }

    // Asset Type filter
    if (AssetTypeId) {
      query.AssetTypeId = AssetTypeId;
    }

    // Parent Asset filter
    if (ParentAssetId) {
      query.ParentAssetId = ParentAssetId;
    }

    const total = await AssetMaster.countDocuments(query);
    const list = await AssetMaster.find(query)
      .populate("ParentAssetId", "AssetName")
      .populate("AssetTypeId", "lookup_value")
      .populate("ReportingAssetID", "AssetName")
      .populate("DesignationTypeId", "lookup_value")
      .populate("DepartmentTypeId", "lookup_value")
      .populate("FleetTypeId", "lookup_value")
      .populate("FuelTypeId", "lookup_value")
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
          AssetTypeId,
          ParentAssetId,
        },
        list: __deepClone(list),
      })
    );
  } catch (error) {
    console.error("Asset List Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
});

// Add new Individual Asset
router.post(
  "/SaveIndividualAsset",
  validateIndividualAssetData,
  // checkDuplicateIndividualAsset,
  async (req, res) => {
    try {
      APIEndPointNo = "#DSF0202";
      const {
        AssetTypeId,
        ParentAssetId,
        AssetName,
        Gender,
        DOB,
        DateOfJoining,
        BloodGroup,
        ReportingAssetID,
        DesignationTypeId,
        DepartmentTypeId,
      } = req.validatedData;

      const newAsset = new AssetMaster({
        AssetTypeId,
        ParentAssetId: ParentAssetId || null,
        AssetName,
        Gender,
        DOB,
        DateOfJoining,
        BloodGroup,
        ReportingAssetID: ReportingAssetID || null,
        DesignationTypeId,
        DepartmentTypeId,
      });

      const savedAsset = await newAsset.save();

      // Create audit log
      await __CreateAuditLog(
        "asset_master",
        "INSERT",
        null,
        savedAsset,
        savedAsset._id,
        req
      );

      return res.json(
        __requestResponse("200", __SUCCESS, {
          asset_id: savedAsset._id,
          message: "Individual Asset created successfully",
        })
      );
    } catch (error) {
      console.log(`${APIEndPointNo} Error:`, error.message);
      return res.json(__requestResponse("500", __SOME_ERROR));
    }
  }
);

// Add new Vehicle Asset
router.post(
  "/SaveVehicleAsset",
  validateVehicleAssetData,
  // checkDuplicateVehicleAsset,
  async (req, res) => {
    try {
      APIEndPointNo = "#DSF0203";
      const {
        AssetTypeId,
        ParentAssetId,
        // AssetName,
        FleetTypeId,
        RegistrationNumber,
        EngineNumber,
        ChassisNumber,
        Model,
        Make,
        Manufacturer,
        Year,
        Color,
        FuelTypeId,
      } = req.validatedData;

      const newAsset = new AssetMaster({
        AssetTypeId,
        ParentAssetId: ParentAssetId || null,
        // AssetName,
        FleetTypeId,
        RegistrationNumber,
        EngineNumber,
        ChassisNumber,
        Model,
        Make,
        Manufacturer,
        Year,
        Color,
        FuelTypeId,
      });

      const savedAsset = await newAsset.save();

      // Create audit log
      await __CreateAuditLog(
        "asset_master",
        "INSERT",
        null,
        savedAsset,
        savedAsset._id,
        req
      );

      return res.json(
        __requestResponse("200", __SUCCESS, {
          asset_id: savedAsset._id,
          message: "Vehicle Asset created successfully",
        })
      );
    } catch (error) {
      console.log(`${APIEndPointNo} Error:`, error.message);
      return res.json(__requestResponse("500", __SOME_ERROR));
    }
  }
);

// Update Individual Asset
router.post(
  "/UpdateIndividualAsset",
  validateIndividualAssetData,
  checkDuplicateIndividualAsset,
  async (req, res) => {
    try {
      APIEndPointNo = "#DSF0204";
      const { asset_id } = req.validatedData;

      if (!asset_id) {
        return res.json(
          __requestResponse("400", "Asset ID is required for update")
        );
      }

      const existingAsset = await AssetMaster.findById(asset_id);
      if (!existingAsset) {
        return res.json(__requestResponse("404", __RECORD_NOT_FOUND));
      }

      const oldData = { ...existingAsset.toObject() };

      const {
        AssetTypeId,
        ParentAssetId,
        AssetName,
        Gender,
        DOB,
        DateOfJoining,
        BloodGroup,
        ReportingAssetID,
        DesignationTypeId,
        DepartmentTypeId,
      } = req.validatedData;

      const updateData = {
        AssetTypeId,
        ParentAssetId: ParentAssetId || null,
        AssetName,
        Gender,
        DOB,
        DateOfJoining,
        BloodGroup,
        ReportingAssetID: ReportingAssetID || null,
        DesignationTypeId,
        DepartmentTypeId,
      };

      const updatedAsset = await AssetMaster.findByIdAndUpdate(
        asset_id,
        updateData,
        { new: true }
      );

      // Create audit log
      await __CreateAuditLog(
        "asset_master",
        "UPDATE",
        oldData,
        updatedAsset,
        asset_id,
        req
      );

      return res.json(
        __requestResponse("200", __SUCCESS, {
          asset_id: updatedAsset._id,
          message: "Individual Asset updated successfully",
        })
      );
    } catch (error) {
      console.log(`${APIEndPointNo} Error:`, error.message);
      return res.json(__requestResponse("500", __SOME_ERROR));
    }
  }
);

// Update Vehicle Asset
router.post(
  "/UpdateVehicleAsset",
  validateVehicleAssetData,
  checkDuplicateVehicleAsset,
  async (req, res) => {
    try {
      APIEndPointNo = "#DSF0205";
      const { asset_id } = req.validatedData;

      if (!asset_id) {
        return res.json(
          __requestResponse("400", "Asset ID is required for update")
        );
      }

      const existingAsset = await AssetMaster.findById(asset_id);
      if (!existingAsset) {
        return res.json(__requestResponse("404", __RECORD_NOT_FOUND));
      }

      const oldData = { ...existingAsset.toObject() };

      const {
        AssetTypeId,
        ParentAssetId,
        // AssetName,
        FleetTypeId,
        RegistrationNumber,
        EngineNumber,
        ChassisNumber,
        Model,
        Make,
        Manufacturer,
        Year,
        Color,
        FuelTypeId,
      } = req.validatedData;

      const updateData = {
        AssetTypeId,
        ParentAssetId: ParentAssetId || null,
        // AssetName,
        FleetTypeId,
        RegistrationNumber,
        EngineNumber,
        ChassisNumber,
        Model,
        Make,
        Manufacturer,
        Year,
        Color,
        FuelTypeId,
      };

      const updatedAsset = await AssetMaster.findByIdAndUpdate(
        asset_id,
        updateData,
        { new: true }
      );

      // Create audit log
      await __CreateAuditLog(
        "asset_master",
        "UPDATE",
        oldData,
        updatedAsset,
        asset_id,
        req
      );

      return res.json(
        __requestResponse("200", __SUCCESS, {
          asset_id: updatedAsset._id,
          message: "Vehicle Asset updated successfully",
        })
      );
    } catch (error) {
      console.log(`${APIEndPointNo} Error:`, error.message);
      return res.json(__requestResponse("500", __SOME_ERROR));
    }
  }
);

// Delete Asset
router.post("/DeleteAsset", async (req, res) => {
  try {
    APIEndPointNo = "#DSF0206";
    const { asset_id } = req.body;

    if (!asset_id) {
      return res.json(__requestResponse("400", "Asset ID is required"));
    }

    const existingAsset = await AssetMaster.findById(asset_id);
    if (!existingAsset) {
      return res.json(__requestResponse("404", __RECORD_NOT_FOUND));
    }

    const oldData = { ...existingAsset.toObject() };
    await AssetMaster.findByIdAndDelete(asset_id);

    // Create audit log
    await __CreateAuditLog(
      "asset_master",
      "DELETE",
      oldData,
      null,
      asset_id,
      req
    );

    return res.json(
      __requestResponse("200", __SUCCESS, {
        message: "Asset deleted successfully",
      })
    );
  } catch (error) {
    console.log(`${APIEndPointNo} Error:`, error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
});

// Get single Asset
router.post("/GetAsset", async (req, res) => {
  try {
    APIEndPointNo = "#DSF0207";
    const { asset_id } = req.body;

    if (!asset_id) {
      return res.json(__requestResponse("400", "Asset ID is required"));
    }

    const asset = await AssetMaster.findById(asset_id)
      .populate("ParentAssetId", "AssetName")
      .populate("AssetTypeId", "lookup_value")
      .populate("ReportingAssetID", "AssetName")
      .populate("DesignationTypeId", "lookup_value")
      .populate("DepartmentTypeId", "lookup_value")
      .populate("FleetTypeId", "lookup_value")
      .populate("FuelTypeId", "lookup_value");

    if (!asset) {
      return res.json(__requestResponse("404", __RECORD_NOT_FOUND));
    }

    return res.json(__requestResponse("200", __SUCCESS, asset));
  } catch (error) {
    console.log(`${APIEndPointNo} Error:`, error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
});

module.exports = router;
