const express = require("express");
const { default: mongoose } = require("mongoose");
const LoginMaster = require("../../../models/LoginMaster");
const {
  __requestResponse,
  __generateAuthToken,
} = require("../../../utils/constent");
const AssetMaster = require("../../../models/AssetMaster");
const router = express.Router();

router.post("/login", async (req, res) => {
  const { phone, password } = req.body;
  try {
    const user = await LoginMaster.findOne({
      LoginId: phone,
    })
      .populate("AssetId") // Populate the AssetId field
      .populate("AssetTypeId");

    const userData = await AssetMaster.findById(user?.AssetId)
      .populate("ParentID")
      .then((data) => {
        if (data.Client && data.Client.ClientTypeID) {
          return data.populate("Client.ClientTypeID");
        }
        return data;
      });

    console.log("User: ", userData);

    if (!user) {
      return res.json(__requestResponse("400", "Phone number doesn't match"));
    } else {
      if (user.LoginId == phone && user.Pwd == password) {
        // let loginUser = {
        //   _id: user.AssetId,
        // };
        const token = __generateAuthToken(user.AssetId);
        const data = {
          token,
          user: userData,
          asset_type: user.AssetTypeId.lookup_value,
          // client_type: user.Client.ClientTypeID.lookup_value,
          isAdmin: user.IsAdmin == true ? true : false,
        };

        return res.json(__requestResponse("200", "Login Successfull", data));
      } else {
        return res.json(__requestResponse("400", "Credentials doesn't match"));
      }
    }
  } catch (error) {
    return res.json(__requestResponse("400", error.message));
  }
});

// {
//     "AssetId": {
//       "$oid": "671cd44091da5cd53972facd"
//     },
//     "AssetTypeId": {
//       "$oid": "671b3d500f4de94dbb74ebe8"
//     },
//     "UserName": "KCC HealthPassport",
//     "LoginId": "1234567890",
//     "Pwd": "1234",
//     "IsFirstLogin": true,
//   }

module.exports = router;
