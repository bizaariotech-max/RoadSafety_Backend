const {
  __requestResponse,
  __generateAuthToken,
} = require("../../../utils/constent");
const {
  __MISSING_LOOKUPCODES,
  __BLANK_LOOKUPCODE,
} = require("../../../utils/variable");

const LookupParser = (req, res, next) => {
  //Parse the request string for Lookup codes and get an array from the string of codes
  //to get all those lookup lists
  let dd = req.body.lookupcodes;
  let newCodes = [];
  if (dd.length === 0) {
    return res.json(__requestResponse("501", __MISSING_LOOKUPCODES));
  } else {
    let _codes = dd.split(",");
    let _emptyFound = false;
    _codes.forEach((element) => {
      if (element.trim() === "") {
        _emptyFound = true;
      } else {
        newCodes.push(element);
      }
    });
    if (!_emptyFound) {
      req.body.CodeList = _codes;
    } else {
      req.body.CodeList = newCodes;
    }
    next();
  }
};

module.exports = {
  LookupParser,
};
