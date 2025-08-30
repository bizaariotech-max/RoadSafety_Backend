// const { fetch } = require("undici"); // Importing undici's fetch API
// const crypto = require("crypto");
// const { Agent } = require("undici");

// /**
//  * Function to send SMS through GupShup API using undici fetch with custom SSL/TLS settings
//  * @param {string} sendTo - The phone number to send the message to.
//  * @param {string} message - The message content.
//  * @param {string} userId - The GupShup user ID.
//  * @param {string} password - The password for authentication.
//  * @param {function} callback - The callback function to handle the response.
//  */
// function sendGupShupMessage(sendTo, message, callback) {
//   const url = "https://enterprise.smsgupshup.com/GatewayAPI/rest";

//   const data = new URLSearchParams({
//     method: "sendMessage",
//     send_to: sendTo,
//     msg: message,
//     msg_type: "TEXT",
//     userid: "2000202726",
//     auth_scheme: "PLAIN",
//     password: "mYXxXUCw",
//     format: "JSON",
//   });

//   // Creating an undici Agent with custom SSL/TLS options
//   const agent = new Agent({
//     connect: {
//       rejectUnauthorized: false, // Disables certificate verification
//       secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT, // Allows legacy SSL/TLS connections
//     },
//   });

//   // Make the request using undici's fetch
//   fetch(url, {
//     method: "POST",
//     body: data,
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded",
//     },
//     dispatcher: agent, // Using the custom agent for the connection
//   })
//     .then((response) => response.json()) // Parse the response as JSON
//     .then((result) => {
//       // Extract the response details from the result
//       console.log(JSON.stringify(result), "result");
//       const status = result.response.status;
//       const messageId = result.response.id;
//       const messageDetails = result.response.details || "No details available";
//       const messageResponse = result.data.response_messages[0]; // Extracting the first response message

//       // Format the output for easier reading
//       const messageStatus = {
//         status,
//         messageId,
//         messageDetails,
//         messageResponse,
//       };

//       callback(null, messageStatus); // Pass the structured message status to callback
//       // callback(null, result.response); // Pass the structured message status to callback
//     })
//     .catch((error) => {
//       callback(error, null); // Error: pass error to callback
//     });
// }

// module.exports = sendGupShupMessage;

// // const { fetch } = require("undici"); // Importing undici's fetch API
// // const crypto = require("crypto");
// // const { Agent } = require("undici");

// // /**
// //  * Function to send SMS through GupShup API using undici fetch with custom SSL/TLS settings
// //  * @param {string} sendTo - The phone number to send the message to.
// //  * @param {string} message - The message content.
// //  * @param {function} callback - The callback function to handle the response.
// //  */
// // function sendGupShupMessage(sendTo, message, callback) {
// //   const url = "https://enterprise.smsgupshup.com/GatewayAPI/rest";

// //   // const data = new URLSearchParams({
// //   //   method: "sendMessage",
// //   //   send_to: sendTo,
// //   //   msg: message,
// //   //   msg_type: "TEXT",
// //   //   userid: "2000202726", // Replace with actual user ID
// //   //   auth_scheme: "PLAIN",
// //   //   password: "mYXxXUCw", // Replace with actual password
// //   //   format: "JSON",
// //   // });

// //   const data = new URLSearchParams({
// //     method: "sendMessage",
// //     send_to: sendTo,
// //     msg: message,
// //     msg_type: "TEXT",
// //     userid: "2000202726",
// //     auth_scheme: "PLAIN",
// //     password: "mYXxXUCw",
// //     format: "JSON",
// //   });

// //   // Creating an undici Agent with custom SSL/TLS options
// //   const agent = new Agent({
// //     connect: {
// //       rejectUnauthorized: false, // Disables certificate verification
// //       secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT, // Allows legacy SSL/TLS connections
// //     },
// //   });

// //   // Make the request using undici's fetch
// //   fetch(url, {
// //     method: "POST",
// //     body: data,
// //     headers: {
// //       "Content-Type": "application/x-www-form-urlencoded",
// //     },
// //     dispatcher: agent, // Using the custom agent for the connection
// //   })
// //     .then((response) => response.json()) // Parse the response as JSON
// //     .then((result) => {
// //       console.log("API Response:", JSON.stringify(result)); // Log the response
// //       const status = result.response.status;
// //       const messageId = result.response.id;
// //       const messageDetails = result.response.details || "No details available";
// //       const messageResponse = result.data.response_messages[0]; // Extracting the first response message

// //       // Format the output for easier reading
// //       const messageStatus = {
// //         status,
// //         messageId,
// //         messageDetails,
// //         messageResponse,
// //       };

// //       callback(null, messageStatus); // Pass the structured message status to callback
// //     })
// //     .catch((error) => {
// //       callback(error, null); // Error: pass error to callback
// //     });
// // }

// // module.exports = sendGupShupMessage;

// // Example usage of the reusable function
// // const sendTo = "919820XXXXXX"; // Replace with the recipient phone number
// // const message = "This is a test message from GupShup!";

// // sendGupShupMessage(sendTo, message, userId, password, (error, result) => {
// //   if (error) {
// //     console.error("Error sending message:", error);
// //   } else {
// //     console.log("Message sent successfully:", result);
// //   }
// // });
