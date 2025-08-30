const mongoose = require("mongoose");
const _Controls = new mongoose.Schema({
  InterfaceId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "admin_user_interfaces",
  },
  ControlCode: { type: String },
  ControlDesc: { type: String },
  IsActive: { type: Boolean },
});
module.exports = mongoose.model("admin_interface_controls", _Controls);
