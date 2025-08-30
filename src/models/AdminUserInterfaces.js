const mongoose = require("mongoose");
const _UI = new mongoose.Schema({
  InterfaceCategoryId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "admin_lookups",
  },
  InterfaceCode: { type: String },
  InterfaceDesc: { type: String },
  IsActive: { type: Boolean },
});
module.exports = mongoose.model("admin_user_interfaces", _UI);
