const mongoose = require("mongoose");
const { __randomNumber, __deepClone } = require("./constent");
const tlbEnvSetting = require("../models/AdminEnvSetting");
const tlbAssetMaster = require("../models/AssetMaster");

async function __AssetCode(AssetType) {
  let _SettingCode;
  let _SettingCodeType;
  let _AssetCode = "";
  let _AssetType;
  let _Prefix = "";
  let _recCount = 0;
  let AssetCode = "";

  switch (AssetType) {
    case "CLIENT":
      _SettingCode = "ASSET_CODE_CLIENT";
      _SettingCodeType = "ASSET_TYPE_CLIENT";
      break;
    case "USER":
      _SettingCode = "ASSET_CODE_USER";
      _SettingCodeType = "ASSET_TYPE_USER";
      break;
    case "FLEET_DRIVER":
      _SettingCode = "ASSET_CODE_FLEET_DRIVER";
      _SettingCodeType = "ASSET_TYPE_FLEET_DRIVER";
      break;
    case "FLEET_CONDUCTOR":
      _SettingCode = "ASSET_CODE_FLEET_CONDUCTOR";
      _SettingCodeType = "ASSET_TYPE_FLEET_CONDUCTOR";
      break;
    case "FLEET_ADMIN":
      _SettingCode = "ASSET_CODE_FLEET_ADMIN";
      _SettingCodeType = "ASSET_TYPE_FLEET_ADMIN";
      break;
    case "RTO_ADMIN":
      _SettingCode = "ASSET_CODE_RTO_ADMIN";
      _SettingCodeType = "ASSET_TYPE_RTO_ADMIN";
      break;
    case "RTO_SUPERVISOR":
      _SettingCode = "ASSET_CODE_RTO_SUPERVISOR";
      _SettingCodeType = "ASSET_TYPE_RTO_SUPERVISOR";
      break;
    case "TRAFFIC_ADMIN":
      _SettingCode = "ASSET_CODE_TRAFFIC_ADMIN";
      _SettingCodeType = "ASSET_TYPE_TRAFFIC_ADMIN";
      break;
    case "HEALTH_COACH":
      _SettingCode = "ASSET_CODE_HEALTH_COACH";
      _SettingCodeType = "ASSET_TYPE_HEALTH_COACH";
      break;
    case "HEALTH_AUDITOR":
      _SettingCode = "ASSET_CODE_HEALTH_AUDITOR";
      _SettingCodeType = "ASSET_TYPE_HEALTH_AUDITOR";
      break;
    case "VEHICLE_INSPECTOR":
      _SettingCode = "ASSET_CODE_VEHICLE_INSPECTOR";
      _SettingCodeType = "ASSET_TYPE_VEHICLE_INSPECTOR";
      break;
  }

  //Get Asset Code Prefix
  const _envSetting = await tlbEnvSetting.findOne({
    EnvSettingCode: _SettingCode,
  });
  if (_envSetting) {
    _Prefix = _envSetting.EnvSettingValue;
  }

  //Get the Asset Type
  const _envSetting1 = await tlbEnvSetting.findOne({
    EnvSettingCode: _SettingCodeType,
  });

  if (_envSetting1) {
    _AssetType = mongoose.Types.ObjectId(_envSetting1.EnvSettingValue);
  }

  //Get Last Asset count of asset Type
  const _clientCount = await tlbAssetMaster.count({
    AssetTypeID: _AssetType,
  });
  if (_clientCount) {
    _recCount = _clientCount;
  }

  _AssetCode = _Prefix + (_recCount + 1).toString().padStart(5, "0");

  let _CodeFound = true;

  while (_CodeFound) {
    const _VerifyAssetUniqueness = await tlbAssetMaster.findOne({
      AssetCode: _AssetCode,
    });
    if (_VerifyAssetUniqueness) {
      _CodeFound = true;
    } else {
      _CodeFound = false;
    }
    if (_CodeFound) {
      _recCount += 1;
      _AssetCode = _Prefix + (_recCount + 1).toString().padStart(5, "0");
    }
  }
  return _AssetCode;
}

module.exports = { __AssetCode };
