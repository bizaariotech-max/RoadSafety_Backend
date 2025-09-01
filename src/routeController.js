const V1 = {
  APP_ROUTE: [],
  ADMIN_ROUTE: [
    require("./v1/Admin/router/adminlookup"),
    require("./v1/Admin/router/adminStation"),
    require("./v1/Admin/router/adminAsset"),
  ],
  COMMON_ROUTE: [
    require("./v1/Common/router/lookup"),
    // require("./v1/Common/router/imageUpload"),
  ],
};
module.exports = { V1 };
