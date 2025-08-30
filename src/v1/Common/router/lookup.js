const express = require("express");
const router = express.Router();

const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
  __NO_LOOKUP_LIST,
  __SUCCESS,
  __SOME_ERROR,
  __VALIDATION_ERROR,
} = require("../../../utils/variable");
const _lookup = require("../../../models/lookupmodel");
const { LookupParser } = require("../middleware/middlelookup");
const { default: mongoose } = require("mongoose");
const Joi = require("joi");
const AdminEnvSetting = require("../../../models/AdminEnvSetting");

// * Lookup list
router.post("/lookuplist", LookupParser, async (req, res) => {
  console.log(req.body);
  console.log("api common lookup list");
  try {
    if (!req?.body?.lookup_type || req?.body?.lookup_type?.length === 0) {
      return res.json(__requestResponse("400", "Lookup type is required"));
    }

    const list = await _lookup
      .find({
        lookup_type: { $in: req?.body?.lookup_type || [] },
        ...(mongoose.Types.ObjectId.isValid(req.body?.parent_lookup_id) && {
          parent_lookup_id: mongoose.Types.ObjectId(req.body?.parent_lookup_id),
        }),
        is_active: true,
      })
      .populate("parent_lookup_id", "lookup_value")
      .lean();

    if (list.length == 0) {
      return res.json(__requestResponse("404", "No Data found"));
    }
    return res.json(__requestResponse("200", __SUCCESS, list));
  } catch (error) {
    return res.json(__requestResponse("500", error.message));
  }
});

router.post("/lookuplistxx", LookupParser, async (req, res) => {
  const { parent_lookup_id } = req.body;
  var _filters = [];
  if (req.body.CodeList.length > 0) {
    req.body.CodeList.forEach(async (element) => {
      _filters.push(element);
    });
    const __parentId = mongoose.Types.ObjectId.isValid(parent_lookup_id)
      ? mongoose?.Types?.ObjectId(parent_lookup_id)
      : null;
    const list = await _lookup
      .find({
        lookup_type: { $in: _filters },
        is_active: true,
        ...(__parentId && {
          parent_lookup_id: __parentId,
        }),
      })
      .sort({ sort_order: 1 });

    if (list.length > 0) {
      const __ImagePathDetails = await AdminEnvSetting.findOne({
        EnvSettingCode: "IMAGE_PATH",
      });
      return res.json(
        __requestResponse(
          "200",
          __SUCCESS,
          __deepClone(list).map((item) => ({
            ...item,
            ...(item?.icon && {
              full_URL:
                (process.env.NODE_ENV == "development"
                  ? process.env.LOCAL_IMAGE_URL
                  : __ImagePathDetails?.EnvSettingTextValue) + item?.icon,

              base_URL: __ImagePathDetails?.EnvSettingTextValue,
            }),
          }))
        )
      );
    } else {
      return res.json(__requestResponse("501", __NO_LOOKUP_LIST));
    }
  } else {
    return res.json(__requestResponse("501", __NO_LOOKUP_LIST));
  }
});





const lookuplistByParent = Joi.object({
  parentId: Joi.string().required(),
  lookupType: Joi.string().required(),
});

router.post("/lookuplistByParent", async (req, res) => {
  try {
    const { error, value } = lookuplistByParent.validate(req.body);

    if (error) {
      return res.json(__requestResponse("400", __VALIDATION_ERROR, error));
    }
    const { parentId, lookupType } = req.body;

    //Get the Parent ID wise lookup List here
    const list = await _lookup.find({
      lookup_type: lookupType,
      parent_lookup_id: mongoose.Types.ObjectId(parentId),
    });

    if (!list || list.length == 0) {
      return res.json(__requestResponse("404", __NO_LOOKUP_LIST));
    }

    return res.json(__requestResponse("200", __SUCCESS, list));
  } catch (error) {
    console.log(error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
});

router.post("/CountryCode", async (req, res) => {
  try {
    //Get the Parent ID wise lookup List here
    const list = await _lookup
      .find({
        lookup_type: "isd_code",
      })
      .populate({
        path: "parent_lookup_id",
        model: "admin_lookups",
        select: "lookup_value",
      });

    if (!list || list.length == 0) {
      return res.json(__requestResponse("404", __NO_LOOKUP_LIST));
    }
    const newList = __deepClone(list).map((item) => ({
      id: item?._id,
      code: item?.lookup_value,
      country: item?.parent_lookup_id?.lookup_value,
      name: [
        item?.parent_lookup_id?.lookup_value,
        "(",
        item?.lookup_value,
        ")",
      ].join(""),
    }));

    return res.json(
      __requestResponse("200", __SUCCESS, {
        defaultSelected: newList.find((list) => list.code == "+91") || null,
        list: newList,
      })
    );
  } catch (error) {
    console.log(error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
});

router.post("/lookup_type", async (req, res) => {
  const { asset_type } = req.body;
  try {
    //Get the Parent ID wise lookup List here
    const list = await _lookup.find({
      lookup_type: asset_type,
    });
    // .populate({
    //     path: "parent_lookup_id",
    //     model: "admin_lookups",
    //     select: "lookup_value",
    // });

    if (!list || list.length == 0) {
      return res.json(__requestResponse("404", __NO_LOOKUP_LIST));
    }

    return res.json(__requestResponse("200", __SUCCESS, list));
  } catch (error) {
    console.log(error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
});

module.exports = router;
