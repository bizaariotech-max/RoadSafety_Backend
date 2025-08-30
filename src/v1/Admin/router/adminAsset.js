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
  validateAssetData,
  checkDuplicateAsset,
} = require("../middleware/middleAsset");
const bcrypt = require("bcrypt");

let APIEndPointNo = "";

// List Assets with filtering and pagination
router.post("/AssetList", async (req, res) => {
  try {
    APIEndPointNo = "#KCC0201";
    const {
      page = 1,
      limit = 10,
      search = "",
      AssetTypeId,
      ParentAssetId
    } = req.body;

    const skip = (page - 1) * limit;
    let filter = {};

    // Search filter
    if (search && search.trim() !== "") {
      filter.$or = [
        { AssetName: { $regex: search, $options: "i" } },
        { PhoneNumber: { $regex: search, $options: "i" } },
        { Email: { $regex: search, $options: "i" } }
      ];
    }

    // Additional filters
    if (AssetTypeId) {
      filter.AssetTypeId = mongoose.Types.ObjectId(AssetTypeId);
    }
    if (ParentAssetId) {
      filter.ParentAssetId = mongoose.Types.ObjectId(ParentAssetId);
    }

    const [assets, totalCount] = await Promise.all([
      AssetMaster.find(filter)
        .populate("ParentAssetId", "AssetName")
        .populate("AssetTypeId", "lookup_value")
        .select("-Password") // Exclude password from response
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AssetMaster.countDocuments(filter)
    ]);

    if (!assets || assets.length === 0) {
      return res.json(__requestResponse("404", __RECORD_NOT_FOUND));
    }

    const responseData = {
      assets,
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

// Add new Asset
router.post("/SaveAsset", validateAssetData, checkDuplicateAsset, async (req, res) => {
  try {
    APIEndPointNo = "#KCC0202";
    const {
      AssetTypeId,
      ParentAssetId,
      AssetName,
      PhoneNumber,
      Email,
      Password
    } = req.validatedData;

    const assetData = {
      AssetTypeId: mongoose.Types.ObjectId(AssetTypeId),
      ParentAssetId: ParentAssetId && ParentAssetId !== "" 
        ? mongoose.Types.ObjectId(ParentAssetId) 
        : null,
      AssetName,
      PhoneNumber,
      Email,
      Password
    };

    const newAsset = await AssetMaster.create(assetData);

    if (newAsset) {
      // Create audit log for insert (exclude password from audit)
      const auditData = { ...newAsset.toObject() };
      delete auditData.Password;
      
      await __CreateAuditLog(
        "asset_master",
        "INSERT",
        "NEW_ASSET",
        null,
        JSON.stringify(auditData),
        newAsset._id,
        null, // ClientId - you may need to get this from req.user or session
        null  // LoginLogId - you may need to get this from req.user or session
      );

      // Remove password from response
      const responseAsset = newAsset.toObject();
      delete responseAsset.Password;

      return res.json(
        __requestResponse("200", "Asset created successfully", responseAsset)
      );
    } else {
      return res.json(__requestResponse("400", __CLIENT_SAVE_ERROR));
    }
  } catch (error) {
    console.log(`${APIEndPointNo} Error:`, error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
});

// Edit/Update Asset
router.post("/UpdateAsset", validateAssetData, checkDuplicateAsset, async (req, res) => {
  try {
    APIEndPointNo = "#KCC0203";
    const { asset_id } = req.validatedData;

    if (!asset_id || asset_id === "") {
      return res.json(__requestResponse("400", "Asset ID is required for update"));
    }

    const existingAsset = await AssetMaster.findById(asset_id);
    if (!existingAsset) {
      return res.json(__requestResponse("404", __RECORD_NOT_FOUND));
    }

    const {
      AssetTypeId,
      ParentAssetId,
      AssetName,
      PhoneNumber,
      Email,
      Password
    } = req.validatedData;

    const updateData = {
      AssetTypeId: mongoose.Types.ObjectId(AssetTypeId),
      ParentAssetId: ParentAssetId && ParentAssetId !== "" 
        ? mongoose.Types.ObjectId(ParentAssetId) 
        : null,
      AssetName,
      PhoneNumber,
      Email
    };

    // Only update password if provided
    if (Password) {
      updateData.Password = Password;
    }

    const updatedAsset = await AssetMaster.findByIdAndUpdate(
      asset_id,
      updateData,
      { new: true, runValidators: true }
    );

    if (updatedAsset) {
      // Create audit log for update (exclude passwords from audit)
      const oldAuditData = { ...existingAsset.toObject() };
      const newAuditData = { ...updatedAsset.toObject() };
      delete oldAuditData.Password;
      delete newAuditData.Password;
      
      await __CreateAuditLog(
        "asset_master",
        "UPDATE",
        "ASSET_MODIFIED",
        JSON.stringify(oldAuditData),
        JSON.stringify(newAuditData),
        updatedAsset._id,
        null, // ClientId
        null  // LoginLogId
      );

      // Remove password from response
      const responseAsset = updatedAsset.toObject();
      delete responseAsset.Password;

      return res.json(
        __requestResponse("200", "Asset updated successfully", responseAsset)
      );
    } else {
      return res.json(__requestResponse("400", "Failed to update asset"));
    }
  } catch (error) {
    console.log(`${APIEndPointNo} Error:`, error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
});

// Delete Asset
router.post("/DeleteAsset", async (req, res) => {
  try {
    APIEndPointNo = "#KCC0204";
    const { asset_id } = req.body;

    if (!asset_id || asset_id === "") {
      return res.json(__requestResponse("400", "Asset ID is required"));
    }

    const existingAsset = await AssetMaster.findById(asset_id);
    if (!existingAsset) {
      return res.json(__requestResponse("404", __RECORD_NOT_FOUND));
    }

    // Check if asset has child assets
    const childAssets = await AssetMaster.find({ ParentAssetId: asset_id });
    if (childAssets.length > 0) {
      return res.json(
        __requestResponse("400", "Cannot delete asset with child assets. Please delete child assets first.")
      );
    }

    // Hard delete the asset
    const deletedAsset = await AssetMaster.findByIdAndDelete(asset_id);

    if (deletedAsset) {
      // Create audit log for delete (exclude password from audit)
      const auditData = { ...existingAsset.toObject() };
      delete auditData.Password;
      
      await __CreateAuditLog(
        "asset_master",
        "DELETE",
        "ASSET_DELETED",
        JSON.stringify(auditData),
        null,
        deletedAsset._id,
        null, // ClientId
        null  // LoginLogId
      );

      return res.json(
        __requestResponse("200", "Asset deleted successfully", { _id: asset_id })
      );
    } else {
      return res.json(__requestResponse("400", "Failed to delete asset"));
    }
  } catch (error) {
    console.log(`${APIEndPointNo} Error:`, error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
});

// Get Asset by ID
router.post("/GetAsset", async (req, res) => {
  try {
    APIEndPointNo = "#KCC0205";
    const { asset_id } = req.body;

    if (!asset_id || asset_id === "") {
      return res.json(__requestResponse("400", "Asset ID is required"));
    }

    const asset = await AssetMaster.findById(asset_id)
      .populate("ParentAssetId", "AssetName")
      .populate("AssetTypeId", "lookup_value")
      .select("-Password"); // Exclude password from response

    if (!asset) {
      return res.json(__requestResponse("404", __RECORD_NOT_FOUND));
    }

    return res.json(__requestResponse("200", __SUCCESS, asset));
  } catch (error) {
    console.log(`${APIEndPointNo} Error:`, error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
});

// Asset Login (Authentication)
router.post("/AssetLogin", async (req, res) => {
  try {
    APIEndPointNo = "#KCC0206";
    const { Email, Password } = req.body;

    if (!Email || !Password) {
      return res.json(__requestResponse("400", "Email and Password are required"));
    }

    const asset = await AssetMaster.findOne({ Email: Email.toLowerCase() })
      .populate("AssetTypeId", "lookup_value")
      .populate("ParentAssetId", "AssetName");

    if (!asset) {
      return res.json(__requestResponse("401", "Invalid email or password"));
    }

    const isPasswordValid = await bcrypt.compare(Password, asset.Password);
    if (!isPasswordValid) {
      return res.json(__requestResponse("401", "Invalid email or password"));
    }

    // Remove password from response
    const responseAsset = asset.toObject();
    delete responseAsset.Password;

    // Create audit log for login
    await __CreateAuditLog(
      "asset_master",
      "LOGIN",
      "ASSET_LOGIN",
      null,
      JSON.stringify({ AssetId: asset._id, Email: asset.Email }),
      asset._id,
      null, // ClientId
      null  // LoginLogId
    );

    return res.json(
      __requestResponse("200", "Login successful", responseAsset)
    );
  } catch (error) {
    console.log(`${APIEndPointNo} Error:`, error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
});

// Change Password
router.post("/ChangeAssetPassword", async (req, res) => {
  try {
    APIEndPointNo = "#KCC0207";
    const { asset_id, currentPassword, newPassword } = req.body;

    if (!asset_id || !currentPassword || !newPassword) {
      return res.json(__requestResponse("400", "Asset ID, current password, and new password are required"));
    }

    if (newPassword.length < 6) {
      return res.json(__requestResponse("400", "New password must be at least 6 characters long"));
    }

    const asset = await AssetMaster.findById(asset_id);
    if (!asset) {
      return res.json(__requestResponse("404", __RECORD_NOT_FOUND));
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, asset.Password);
    if (!isCurrentPasswordValid) {
      return res.json(__requestResponse("401", "Current password is incorrect"));
    }

    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    const updatedAsset = await AssetMaster.findByIdAndUpdate(
      asset_id,
      { Password: hashedNewPassword },
      { new: true }
    );

    if (updatedAsset) {
      // Create audit log for password change
      await __CreateAuditLog(
        "asset_master",
        "UPDATE",
        "PASSWORD_CHANGED",
        "Password Updated",
        "Password Updated",
        updatedAsset._id,
        null, // ClientId
        null  // LoginLogId
      );

      return res.json(
        __requestResponse("200", "Password changed successfully", { _id: asset_id })
      );
    } else {
      return res.json(__requestResponse("400", "Failed to change password"));
    }
  } catch (error) {
    console.log(`${APIEndPointNo} Error:`, error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
});

module.exports = router;