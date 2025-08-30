const { __randomNumber } = require("./constent");

/**
 * Generates a verification code for a user and saves it in the database.
 * @param {Object} user - The user object.
 * @param {string} user._id - The user's ID.
 * @returns {Promise<void>} - A promise that resolves when the verification code is created.
 */
const __verificationCode = async (user) => {
    const randomNumber = await __randomNumber();
};

module.exports = { __verificationCode };
