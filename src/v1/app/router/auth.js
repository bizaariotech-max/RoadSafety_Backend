const express = require("express");
const router = express.Router();
// const Vehicle = require("../../../models/VehicleMaster")

const {
  __requestResponse,
  __generateAuthToken,
  __getUserIdFromToken,
} = require("../../../utils/constent");
// const {
//     __NO_LOOKUP_LIST,
//     __SUCCESS,
//     __SOME_ERROR,
//     __VALIDATION_ERROR,
// } = require("../../../utils/variable");
const _lookup = require("../../../models/lookupmodel");
// const { LookupParser } = require("../middleware/middlelookup");
// const { default: mongoose } = require("mongoose");
// const Joi = require("joi");
const AdminEnvSetting = require("../../../models/AdminEnvSetting");
const { __fetchToken } = require("../middleware/authentication");
const Signup = require("../../../models/Signup");
const AssetMaster = require("../../../models/AssetMaster");
const LoginMaster = require("../../../models/LoginMaster");
const { generateStrongPassword } = require("../../../utils/password");
// const { sendSMS } = require("../../../utils/smsCode");
// const sendGupshupMessage = require("../../../utils/smsCode");
// const sendGupShupMessage = require("../../../utils/smsCode");

router.post("/", async (req, res) => {
  try {
    const { fname, lname, phone, email, password } = req.body;

    const existingEmail = await Signup.findOne({ EmailAddress: email });
    if (existingEmail) {
      return res
        .status(400)
        .json(__requestResponse("400", "Email already exists"));
    }

    const existingPhone = await Signup.findOne({ MobileNo: phone });
    if (existingPhone) {
      return res.json(__requestResponse("400", "Phone number already exists"));
    }

    const data = {
      FirstName: fname,
      LastName: lname,
      MobileNo: phone,
      EmailAddress: email,
      Pwd: password,
    };

    const user = new Signup(data);
    await user.save();

    return res.json(__requestResponse("200", __SUCCESS, user));
  } catch (error) {
    console.error(error);
    return res.json(__requestResponse("501", __NO_LOOKUP_LIST));
  }
});

router.post("/individual_user/signup", async (req, res) => {
  try {
    const {
      gender,
      lastname,
      LoginValue,
      firstname,
      email,
      dob,
      CountryCode,
      nationality,
    } = req.body;

    let data = {
      FirstName: firstname,
      LastName: lastname,
      DOB: dob,
      Gender: gender,
      CountryCodeID: CountryCode,
      MobileNo: LoginValue,
      EmailAddress: email,
      NationalityID: nationality,
      // PostalCode: postalCode,
      // LocationID: locality,
    };

    const _adminEnvSetting = await AdminEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_INDIVIDUAL_USER",
    });

    if (!_adminEnvSetting) {
      return res.json(__requestResponse("400", "Asset Type is not Defined"));
    }

    let mainData = {
      AssetTypeID: _adminEnvSetting.EnvSettingValue,
      AssetName: firstname + " " + lastname,
      User: data,
    };

    const user = await AssetMaster.create(mainData);

    if (user) {
      try {
        let pswData = {
          AssetTypeId: user.AssetTypeID,
          AssetId: user._id,
          UserName: user.AssetName,
          LoginId: user.User.MobileNo.toString(),
          IsFirstLogin: true,
          // Pwd: generateStrongPassword(12),
          Pwd: "1234",
        };

        const createPassword = await LoginMaster.create(pswData);

        // let number = `91${user.User.MobileNo.toString()}`;
        // const message = `Your password for your registered number is ${pswData.Pwd}`;

        // try {
        //   let sms = await sendSMS(number, message);
        //   console.log("sms:", sms);
        // } catch (error) {
        //   console.log(error);
        // }

        // console.log("sms:", sms);

        if (!createPassword) {
          return res.json(__requestResponse("400", "Something Went Wrong"));
        }
      } catch (error) {
        console.log("error:", error);
        return res.json(__requestResponse("400", "Something Went Wrong"));
      }
    }

    return res.json(__requestResponse("200", "SignUp Successfull", user));

    // if (user) {

    //   return res.json(__requestResponse("200", "Successfully Signup", user));
    // } else {
    //   return res.json(
    //     __requestResponse(
    //       "400",
    //       "Sometechnical issue occured please try again after some time"
    //     )
    //   );
    // }
  } catch (error) {
    return res.json(
      __requestResponse(
        "400",
        "Sometechnical issue occured please try again after some time"
      )
    );
  }
});

// router.post("/login", async (req, res) => {
//     try {
//         const { phone, email, password } = req.body;

//         const existingEmail = await Signup.findOne({ EmailAddress: email });
//         if (existingEmail) {
//             return res.status(400).json(__requestResponse("400", "Email already exists"));
//         }

//         const existingPhone = await Signup.findOne({ MobileNo: phone });
//         if (existingPhone) {
//             return res.json(__requestResponse("400", "Phone number already exists"));
//         }

//         const data = {
//             FirstName: fname,
//             LastName: lname,
//             MobileNo: phone,
//             EmailAddress: email,
//             Pwd: password
//         };

//         const user = new Signup(data);
//         await user.save();

//         return res.json(
//             __requestResponse(
//                 "200",
//                 __SUCCESS,
//                 user
//             )
//         );
//     } catch (error) {
//         console.error(error);
//         return res.json(__requestResponse("501", __NO_LOOKUP_LIST));
//     }
// });

router.post("/health_coach_accessor/login", async (req, res) => {
  try {
    const { mobile, password } = req.body;
    // const phone = 8269192105;
    // const password = "GTSKxCEl%tdK";
    // Example usage of the reusable function
    // const sendTo = "918349895717"; // Correct phone number with country code
    // const message =
    //   "Your one-time password (OTP) is 123456 to verify your mobile number with Health Passport. OTP is valid for 15 minutes.";

    // sendGupShupMessage(sendTo, message, (error, result) => {
    //   if (error) {
    //     console.error("Error sending message:", error);
    //   } else {
    //     console.log("Message sent successfully:", result);
    //   }
    // });
    // const sendTo = "8467020498";
    // const message =
    //   "%7B%23var%23%7D%20is%20your%20one-time%20password%20%28OTP%29%20to%20verify%20your%20mobile%20number%20with%20Health%20Passport.%20OTP%20is%20valid%20for%2015%20minu";

    // const message =
    //   "%7B%23var%23%7D%20is%20your%20one-time%20password%20%28OTP%29%20to%20verify%20your%20mobile%20number%20with%20Health%20Passport.%20OTP%20is%20valid%20for%2015%20minu";

    // Append phone and password to the message
    // const formattedMessage = `${message}&phone=${encodeURIComponent(
    //   phone
    // )}&password=${encodeURIComponent(password)}`;

    // console.log(formattedMessage, "formattedMessage");

    // const callbackFunction = (error, result) => {
    //   if (error) {
    //     console.error("Error sending message:", error);
    //   } else {
    //     console.log("Message sent successfully:", result);
    //   }
    // };

    // sendGupShupMessage(sendTo, message, callbackFunction);

    const _adminEnvSetting = await AdminEnvSetting.find({
      EnvSettingCode: {
        $in: ["ASSET_TYPE_HEALTH_COACH", "ASSET_TYPE_ACCESSOR"],
      },
    });

    if (!_adminEnvSetting) {
      return res.json(__requestResponse("400", "Asset Type is not Defined"));
    }

    const assetTypes = _adminEnvSetting.map(
      (setting) => setting.EnvSettingValue
    );

    const _user = await AssetMaster.find({
      AssetTypeID: { $in: assetTypes },
    }).populate("AssetTypeID");

    console.log("users:", _user);

    const data = _user.filter((ele) => {
      // return ele.FleetDriver?.MobileNo == phone || ele.User?.MobileNo == phone;
      return (
        ele?.HealthCoach?.MobileNo == mobile ||
        ele?.Accessor?.MobileNo == mobile
      );
    });

    console.log("data:", data);

    if (!data[0]) {
      return res.json(__requestResponse("400", "Phone Number Does not exist"));
    }

    try {
      const fetchPassword = await LoginMaster.findOne({ AssetId: data[0]._id });

      if (fetchPassword.Pwd == password) {
        // console.log("data:", data[0]);
        const token = __generateAuthToken(data[0]);
        let resData = {
          token,
          profile_data:
            data[0].AssetTypeID.lookup_value == "Health Coach"
              ? data[0]?.HealthCoach
              : data[0]?.Accessor,
          // profile_data: data[0]?.HealthCoach,
          isFirstLogin: fetchPassword?.IsFirstLogin,
        };
        return res.json(__requestResponse("200", "Login Successfull", resData));
      } else {
        return res.json(__requestResponse("400", "Credentials Does not match"));
      }
    } catch (error) {
      return res.json(
        __requestResponse("400", "Something Went Wrong Please try again later")
      );
    }

    // Above is the api

    // const getMobileNumber = (document) => {
    //   if (document.FleetDriver && document.FleetDriver.MobileNo) {
    //     return document.FleetDriver.MobileNo;
    //   }
    //   return null;
    // };

    // // Loop through the documents to extract the mobile number
    // const mobileNumbers = _user.map((doc) => getMobileNumber(doc));

    // Log the mobile numbers
    // console.log("User:", mobileNumbers);

    // const existingEmail = await Signup.findOne({ EmailAddress: email });
    // if (existingEmail) {
    //     return res.status(400).json(__requestResponse("400", "Email already exists"));
    // }

    // const existingPhone = await Signup.findOne({ MobileNo: phone });
    // if (existingPhone) {
    //     return res.json(__requestResponse("400", "Phone number already exists"));
    // }

    // const data = {
    //     FirstName: fname,
    //     LastName: lname,
    //     MobileNo: phone,
    //     EmailAddress: email,
    //     Pwd: password
    // };

    // const user = new Signup(data);
    // await user.save();

    // return res.json(
    //     __requestResponse(
    //         "200",
    //         __SUCCESS,
    //         user
    //     )
    // );
  } catch (error) {
    console.error(error);
    // return res.json(__requestResponse("501", __NO_LOOKUP_LIST));
  }
});

router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    // const phone = 8269192105;
    // const password = "GTSKxCEl%tdK";
    // Example usage of the reusable function
    // const sendTo = "918349895717"; // Correct phone number with country code
    // const message =
    //   "Your one-time password (OTP) is 123456 to verify your mobile number with Health Passport. OTP is valid for 15 minutes.";

    // sendGupShupMessage(sendTo, message, (error, result) => {
    //   if (error) {
    //     console.error("Error sending message:", error);
    //   } else {
    //     console.log("Message sent successfully:", result);
    //   }
    // });
    // const sendTo = "8467020498";
    // const message =
    //   "%7B%23var%23%7D%20is%20your%20one-time%20password%20%28OTP%29%20to%20verify%20your%20mobile%20number%20with%20Health%20Passport.%20OTP%20is%20valid%20for%2015%20minu";

    // const message =
    //   "%7B%23var%23%7D%20is%20your%20one-time%20password%20%28OTP%29%20to%20verify%20your%20mobile%20number%20with%20Health%20Passport.%20OTP%20is%20valid%20for%2015%20minu";

    // Append phone and password to the message
    // const formattedMessage = `${message}&phone=${encodeURIComponent(
    //   phone
    // )}&password=${encodeURIComponent(password)}`;

    // console.log(formattedMessage, "formattedMessage");

    // const callbackFunction = (error, result) => {
    //   if (error) {
    //     console.error("Error sending message:", error);
    //   } else {
    //     console.log("Message sent successfully:", result);
    //   }
    // };

    // sendGupShupMessage(sendTo, message, callbackFunction);

    const _adminEnvSetting = await AdminEnvSetting.find({
      EnvSettingCode: {
        $in: ["ASSET_TYPE_FLEET_DRIVER", "ASSET_TYPE_INDIVIDUAL_USER"],
      },
    });

    if (!_adminEnvSetting) {
      return res.json(__requestResponse("400", "Asset Type is not Defined"));
    }

    const assetTypes = _adminEnvSetting.map(
      (setting) => setting.EnvSettingValue
    );

    const _user = await AssetMaster.find({
      AssetTypeID: { $in: assetTypes },
    }).populate("AssetTypeID");

    const data = _user.filter((ele) => {
      return ele.FleetDriver?.MobileNo == phone || ele.User?.MobileNo == phone;
    });

    if (!data[0]) {
      return res.json(__requestResponse("400", "Phone Number Does not exist"));
    }

    try {
      const fetchPassword = await LoginMaster.findOne({ AssetId: data[0]._id });

      console.log("AssetType:", data[0].AssetTypeID.lookup_value);

      if (fetchPassword.Pwd == password) {
        // console.log("data:", data[0]);
        const token = __generateAuthToken(data[0]);
        let resData = {
          token,
          userID: data[0]._id,
          profile_data:
            data[0].AssetTypeID.lookup_value == "Fleet Driver"
              ? data[0]?.FleetDriver
              : data[0]?.User,
          isFirstLogin: fetchPassword?.IsFirstLogin,
        };
        return res.json(__requestResponse("200", "Login Successfull", resData));
      } else {
        return res.json(__requestResponse("400", "Credentials Does not match"));
      }
    } catch (error) {
      return res.json(
        __requestResponse("400", "Something Went Wrong Please try again later")
      );
    }

    // Above is the api

    // const getMobileNumber = (document) => {
    //   if (document.FleetDriver && document.FleetDriver.MobileNo) {
    //     return document.FleetDriver.MobileNo;
    //   }
    //   return null;
    // };

    // // Loop through the documents to extract the mobile number
    // const mobileNumbers = _user.map((doc) => getMobileNumber(doc));

    // Log the mobile numbers
    // console.log("User:", mobileNumbers);

    // const existingEmail = await Signup.findOne({ EmailAddress: email });
    // if (existingEmail) {
    //     return res.status(400).json(__requestResponse("400", "Email already exists"));
    // }

    // const existingPhone = await Signup.findOne({ MobileNo: phone });
    // if (existingPhone) {
    //     return res.json(__requestResponse("400", "Phone number already exists"));
    // }

    // const data = {
    //     FirstName: fname,
    //     LastName: lname,
    //     MobileNo: phone,
    //     EmailAddress: email,
    //     Pwd: password
    // };

    // const user = new Signup(data);
    // await user.save();

    // return res.json(
    //     __requestResponse(
    //         "200",
    //         __SUCCESS,
    //         user
    //     )
    // );
  } catch (error) {
    console.error(error);
    // return res.json(__requestResponse("501", __NO_LOOKUP_LIST));
  }
});

router.post("/UpdateProfile", async (req, res) => {
  try {
    const {
      token,
      DLExpiry,
      DLNumber,
      blood_group,
      is_blood_donation,
      is_orgain_donation,
      pre_existing,
    } = req.body;

    // Get the user ID from the token
    const userId = __getUserIdFromToken(token);

    // Prepare the data to be updated
    // let UserDataUpdate = {
    //   DLNumber: DLNumber,
    //   DLExpiry: DLExpiry,
    //   BloodGroupID: blood_group,
    //   pleadgeblooddonation: is_blood_donation,
    //   pleadgeorgandonation: is_orgain_donation,
    //   PreExistingDisease: pre_existing.length ? pre_existing : null,
    // };

    let UserDataUpdate;

    // console.log("UserDataUpdate:", UserDataUpdate);

    console.log("userId:", userId);

    const findUserLookupValue = await AssetMaster.findOne({
      _id: userId,
    }).populate("AssetTypeID");

    if (findUserLookupValue?.AssetTypeID?.lookup_value == "Fleet Driver") {
      UserDataUpdate = {
        ...findUserLookupValue?.FleetDriver,
        DLNumber: DLNumber,
        DLExpiry: DLExpiry,
        BloodGroupID: blood_group,
        pleadgeblooddonation: is_blood_donation,
        pleadgeorgandonation: is_orgain_donation,
        PreExistingDisease: pre_existing.length ? pre_existing : null,
      };

      // console.log("Error:", findUserLookupValue?.AssetTypeID?.lookup_value);
      UserDataUpdate = {
        FleetDriver: UserDataUpdate,
      };
    } else {
      console.log("Error:", findUserLookupValue?.AssetTypeID?.lookup_value);

      UserDataUpdate = {
        ...findUserLookupValue?.User,
        DLNumber: DLNumber,
        DLExpiry: DLExpiry,
        BloodGroupID: blood_group,
        pleadgeblooddonation: is_blood_donation,
        pleadgeorgandonation: is_orgain_donation,
        PreExistingDisease: pre_existing.length ? pre_existing : null,
      };

      UserDataUpdate = {
        User: UserDataUpdate,
      };
    }

    // Assuming you are updating the user profile (not creating a road accident)
    // Here, you should update the user's data in the database.
    // Example (using a hypothetical `User` model):

    // console.log("User Data:", UserDataUpdate);

    const updatedUser = await AssetMaster.updateOne(
      { _id: userId },
      { $set: UserDataUpdate },
      {
        new: true,
      }
    );

    if (updatedUser) {
      try {
        const value = await LoginMaster.updateOne(
          { AssetId: userId },
          { $set: { IsFirstLogin: false } },
          {
            new: true,
          }
        );

        console.log("value:", value);
      } catch (error) {
        console.log("error:", error);
      }
    }

    if (updatedUser) {
      if (findUserLookupValue?.AssetTypeID?.lookup_value == "Fleet Driver") {
        return res.json(
          __requestResponse(
            "200",
            "Profile updated successfully.",
            findUserLookupValue?.FleetDriver
          )
        );
      } else {
        return res.json(
          __requestResponse(
            "200",
            "Profile updated successfully.",
            findUserLookupValue?.User
          )
        );
      }
    } else {
      return res.json(
        __requestResponse("400", "Something went wrong, please try again.")
      );
    }
  } catch (error) {
    console.log(error, ":error");
    return res.json(
      __requestResponse("400", "Something went wrong, please try again.")
    );
  }
});

module.exports = router;
