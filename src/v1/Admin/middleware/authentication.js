const jwt = require("jsonwebtoken");
const { __requestResponse } = require("../../../utils/constent");
const { __TOKEN_EXPIRED } = require("../../../utils/variable");

const _jwtSecret = process.env.JWT_SECRET;

const __fetchToken = async (req, res, next) => {
  try {
    const token = req.header("auth-token")?.split(" ")[1];
    console.log("token:", token);
    if (!token) {
      return res.send(__requestResponse("401", __TOKEN_EXPIRED));
    }

    const data = jwt.verify(token, _jwtSecret);
    req.user = data.user;

    next();
  } catch (error) {
    return res.send(__requestResponse("401", __TOKEN_EXPIRED));
  }
};

module.exports = {
  __fetchToken,
};
