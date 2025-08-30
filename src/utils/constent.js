const jwt = require("jsonwebtoken");

const _jwtSecret = process.env.JWT_SECRET;
const path = require("path");
const fs = require("fs");

/**
 * Creates a response object with a response code, response message, and data.
 * @param {number} response_code - The response code.
 * @param {string} response_message - The response message.
 * @param {*} data - The data to be included in the response object.
 * @returns {object} - The response object.
 */
function __requestResponse(response_code, response_message, data) {
  return {
    response: {
      response_code,
      response_message,
    },
    data,
  };
}

/**
 * Generates a JSON Web Token (JWT) for a given user object.
 * @param {Object} user - The user object.
 * @param {string} user._id - The user ID.
 * @returns {string} - The generated JWT.
 */
function __generateAuthToken(user) {
  const data = {
    user: {
      id: user._id,
    },
  };
  const authtoken = jwt.sign(data, _jwtSecret);
  // const authtoken = jwt.sign(data, process.env.JWT_SECRET, {
  //     expiresIn: "12h",
  // });
  return authtoken;
}

function __getUserIdFromToken(token) {
  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, _jwtSecret); // Use the same secret as in __generateAuthToken
    // Access the user id from the decoded token
    return decoded.user.id;
  } catch (err) {
    // If the token is invalid or expired, return an error message or null
    console.error("Invalid token", err);
    return null;
  }
}

/**
 * Generates a random 4-digit number between 1000 and 9999.
 * @returns {number} The random 4-digit number.
 */
function __randomNumber() {
  const min = 1000;
  const max = 9999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const __deleteFile = (filePath) => {
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`File not found at path: ${filePath}`);
      return;
    }

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
        return;
      }
      console.log(`File at path: ${filePath} has been deleted.`);
    });
  });
};

function __deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function __transformData({ list, name, id }) {
  return list.map((item) => {
    return {
      id: item[id],
      name: item[name],
    };
  });
}
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
function __formatDate(date) {
  let inputDate = new Date(date);
  if (!(inputDate instanceof Date)) {
    throw new Error("Input must be a valid Date object");
  }

  const day = inputDate.getDate().toString().padStart(2, "0");

  const month = Number(inputDate.getMonth()) + 1;
  const year = inputDate.getFullYear();

  const formattedDate = `${day}-${month}-${year}`;
  return formattedDate;
}
function __formatDateddMMMyyyy(date) {
  let inputDate = new Date(date);
  if (!(inputDate instanceof Date)) {
    throw new Error("Input must be a valid Date object");
  }

  const day = inputDate.getDate().toString().padStart(2, "0");

  const month = monthNames[Number(inputDate.getMonth())];
  const year = inputDate.getFullYear();

  const formattedDate = `${day}-${month}-${year}`;
  return formattedDate;
}
module.exports = {
  __requestResponse,
  __generateAuthToken,
  __randomNumber,
  __deleteFile,
  __deepClone,
  __transformData,
  __formatDate,
  __formatDateddMMMyyyy,
  __getUserIdFromToken,
};
