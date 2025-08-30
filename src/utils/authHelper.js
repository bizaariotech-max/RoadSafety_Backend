const bcrypt = require("bcryptjs");
const LoginMaster = require("../models/LoginMaster");

/**
 * Generate a strong password.
 * @param {number} length
 * @returns {string}
 */
const generateStrongPassword = (length = 12) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};

/**
 * Create login credentials for a given asset with encrypted password.
 * @param {object} options - Object containing asset info.
 * @param {ObjectId} options.assetId - Asset ID
 * @param {ObjectId} options.assetTypeId - Asset Type ID
 * @param {string} options.assetName - Name of the asset
 * @param {string} options.mobileNo - Mobile number (used as login)
 * @param {boolean} [options.isAdmin=false] - Is admin login
 * @returns {object} created login record
 */
const createAssetLogin = async ({
  assetId,
  assetTypeId,
  assetName,
  mobileNo,
  password,
  isAdmin = false,
}) => {
  if (!mobileNo || !assetId || !assetTypeId || !assetName) {
    throw new Error("Missing required fields to create login");
  }

  // const plainPassword = generateStrongPassword(12);
  // const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // for development only
  // let plainPassword = 123456;

  const loginData = {
    AssetTypeId: assetTypeId,
    AssetId: assetId,
    UserName: assetName,
    LoginId: mobileNo,
    IsFirstLogin: true,
    // Pwd: hashedPassword,
    Pwd: password,
    IsAdmin: isAdmin,
  };

  const created = await LoginMaster.create(loginData);

  return {
    ...created.toObject(),
    plainPassword,
  };
};

const updateAssetLogin = async ({
  assetId,
  mobileNo,
  password,
  assetTypeId,
  assetName,
}) => {
  if (!assetId) {
    throw new Error("Asset ID is required to update login credentials");
  }

  // Prepare update object
  const updateFields = {};
  if (assetTypeId) updateFields.AssetTypeId = assetTypeId;
  if (assetId) updateFields.AssetId = assetId;
  if (mobileNo) updateFields.LoginId = mobileNo;
  if (assetName) updateFields.UserName = assetName;
  if (password) {
    // const hashedPassword = await bcrypt.hash(password, 10);
    updateFields.Pwd = password; // Replace with `hashedPassword` in prod
  }

  // Perform update
  const updated = await LoginMaster.findOneAndUpdate(
    { AssetId: assetId },
    { $set: updateFields },
    { new: true }
  );

  if (!updated) {
    throw new Error("Login record not found for the given asset");
  }

  return updated;
};

module.exports = {
  generateStrongPassword,
  createAssetLogin,
  updateAssetLogin,
};
