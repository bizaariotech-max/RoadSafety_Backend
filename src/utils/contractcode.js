const mongoose = require("mongoose");
const tlbContract = require("../models/Contracts");

async function __ContractCode() {
  let _recCount = 0;
  let _ContractCode = "";
  let _Prefix = "CON";
  const _contractCount = await tlbContract.count();
  if (_contractCount) {
    _recCount = _contractCount;
  }

  _ContractCode = _Prefix + (_recCount + 1).toString().padStart(5, "0");

  return _ContractCode;
}

module.exports = { __ContractCode };
