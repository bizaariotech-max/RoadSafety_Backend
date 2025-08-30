const express = require("express");
const { default: mongoose } = require("mongoose");
const router = express.Router();
const _lookup = require("../../../models/lookupmodel");
const { __requestResponse } = require("../../../utils/constent");
const {
  __NO_LOOKUP_LIST,
  __LOOKUP_SAVE_ERROR,
  __SUCCESS,
  __SOME_ERROR,
} = require("../../../utils/variable");
const {
  LookupParser,
  checkLookupforInsert,
} = require("../middleware/middleadminlookup");

const TlbLookup = require("../../../models/lookupmodel");
const { __CreateAuditLog } = require("../../../utils/auditlog");

router.get("/LookupTypeList", async (req, res) => {
  try {
    const list = await _lookup.distinct("lookup_type");

    if (!list || list.length == 0) {
      return res.json(__requestResponse("404", __NO_LOOKUP_LIST));
    }
    return res.json(__requestResponse("200", __SUCCESS, list));
  } catch (error) {
    console.log(error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
});

router.get("/ParentLookupTypeList", async (req, res) => {
  try {
    const list = await _lookup.distinct("parent_lookup_type");
    if (!list || list.length == 0) {
      return res.json(__requestResponse("404", __NO_LOOKUP_LIST));
    }
    return res.json(__requestResponse("200", __SUCCESS, list));
  } catch (error) {
    console.log(error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
});

router.post("/LookupList", LookupParser, async (req, res) => {
  var _list = [];
  var _filters = [];
  console.log("req.body.CodeList", req.body.CodeList);

  if (req.body.CodeList.length > 0) {
    req.body.CodeList.forEach(async (element) => {
      _filters.push(element?.toLowerCase());
    });

    await _lookup
      .find({ lookup_type: { $in: _filters }, is_active: true })
      .then((x) => {
        _list = x;
      })
      .catch((err) => {
        console.log("Fatal Error in lookuplist:", err);
      });

    if (_list.length > 0) {
      return res.json(__requestResponse("200", __SUCCESS, _list));
    } else {
      return res.json(__requestResponse("501", __NO_LOOKUP_LIST));
    }
  } else {
    return res.json(__requestResponse("501", __NO_LOOKUP_LIST));
  }
});

router.post("/SaveLookup", checkLookupforInsert, async (req, res) => {
  let _lookup_id = req.body.lookup_id;
  let _lookup_type = req.body.lookup_type;
  let _lookup_value = req.body.lookup_value;
  let _client_id = req.client_id;
  let _parent_lookup_Id = req.body.parent_lookup_id;
  let _parent_lookup_type = req.parent_lookup_type;
  let _sort_order = req.sort_order;
  let _is_active = req.is_active;
  let _managed_by_ui = req.managed_by_ui;
  //console.log("parent lookup id:", _parent_lookup_Id);
  if (_lookup_id == null || _lookup_id == "") {
    //Insert new lookup
    let _lookupData = {
      client_id: mongoose.Types.ObjectId(_client_id),
      lookup_type: _lookup_type,
      lookup_value: _lookup_value,
      parent_lookup_id: _parent_lookup_Id
        ? mongoose.Types.ObjectId(_parent_lookup_Id)
        : null,
      parent_lookup_type: _parent_lookup_type,
      sort_order: _sort_order,
      is_active: _is_active,
      managed_by_ui: _managed_by_ui,
    };
    //console.log("lookup Data", _lookupData);
    await _lookup.create(_lookupData).then((x) => {
      __CreateAuditLog(
        "admin_lookup",
        "Lookup.Add",
        null,
        null,
        _lookupData,
        x._id,
        _client_id,
        null
      );
      return res.json(__requestResponse("200", __SUCCESS, x));
    });
  } else {
    //get the Old Record to save in Audit log
    const _oldrec = await _lookup.findOne({ _id: _lookup_id });

    _lookupData = {
      client_id: mongoose.Types.ObjectId(_client_id),
      lookup_type: _lookup_type,
      lookup_value: _lookup_value,
      parent_lookup_Id: mongoose.Types.ObjectId(_parent_lookup_Id),
      parent_lookup_type: _parent_lookup_type,
      sort_order: _sort_order,
      is_active: _is_active,
      managed_by_ui: _managed_by_ui,
    };
    __CreateAuditLog(
      "admin_lookup",
      "Lookup.Edit",
      null,
      _oldrec ? _oldrec : null,
      _lookupData,
      _lookup_id,
      _client_id,
      null
    );
    const _updateLookup = await TlbLookup.findByIdAndUpdate(_lookup_id, {
      $set: {
        client_id: mongoose.Types.ObjectId(_client_id),
        lookup_type: _lookup_type,
        lookup_value: _lookup_value,
        parent_lookup_Id: mongoose.Types.ObjectId(_parent_lookup_Id),
        parent_lookup_type: _parent_lookup_type,
        sort_order: _sort_order,
        is_active: _is_active,
        managed_by_ui: _managed_by_ui,
      },
    });

    return res.json(__requestResponse("200", __SUCCESS, _updateLookup));
  }
});


// router.get("/SignupCoverageList", (req, res) => {
//   //Get the list of PinCodes in Signup Coverage
// });
// router.post("/SaveSignupCoverage", (req, res) => {
//   //Save/Update the pincodes for signup coverage for apps.
//   /*
//   Input Body for the endpoint
//   {
//     application_id:objectid,
//     asset_type_id:objectid,
//     pin_codes:"201301,201307,201306",
//     is_active:true
//   }
//   */
//   let _PinCodes = req.body.pin_codes.split(",");
//   let _ApplicationID = req.body.application_id;
//   let _AssetTypeID = req.body.asset_type_id;
//   let _IsActive = req.body.is_active;
//   let _postalCodes = [];
//   if (_PinCodes.length > 0) {
//     _PinCodes.forEach((element) => {
//       let _tempCode = {
//         ApplicationID: _ApplicationID,
//         PostCode: element,
//         AssetTypeID: _AssetTypeID,
//         IsActive: _IsActive,
//       };
//       _postalCodes.push(_tempCode);
//     });
//     _signupCoverage.insertMany(_postalCodes);
//   }
// });


router.post("/LookupDisplayList", async (req, res) => {
  const _list = await TlbLookup.aggregate([
    {
      $match: { lookup_type: req.body.lookupType },
    },

    {
      $lookup: {
        from: "admin_lookups",
        localField: "parent_lookup_id",
        foreignField: "_id",
        as: "ParentLookup",
      },
    },
    {
      $unwind: {
        path: "$ParentLookup",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "asset_masters",
        localField: "client_id",
        foreignField: "_id",
        as: "Clients",
      },
    },
    {
      $unwind: {
        path: "$Clients",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        "Clients.AssetName": 1,
        "Clients.AssetCode": 1,
        "Clients.AssetTypeID": 1,
        lookup_type: 1,
        lookup_value: 1,
        parent_lookup_type: 1,
        parent_lookup_id: 1,
        sort_order: 1,
        is_active: 1,
        CreatedAt: {
          $dateToString: {
            format: "%d-%b-%G %H:%M:%S",
            date: "$createdAt",
            timezone: "+05:30",
          },
        },
        UpdatedAt: {
          $dateToString: {
            format: "%d-%b-%G %H:%M:%S",
            date: "$updatedAt",
            timezone: "+05:30",
          },
        },
        ParentLookup: "$ParentLookup.lookup_value",
      },
    },
  ]);

  return res.json(__requestResponse("200", __SUCCESS, _list));
});

module.exports = router;
