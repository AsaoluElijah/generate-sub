const https = require("https");
const fs = require("fs");
const crypto = require("crypto");

const randomStr = crypto.randomBytes(5).toString("hex");

/** *
 * downloadFile - asynchronously download a file
 * @param {string} fileUrl - the url to download
 * @returns {<Promise>} - success or error
 */

const downloadFile = async (fileUrl) => {
  const filePath = `temp/download-${randomStr}.mp4`;
  const file = fs.createWriteStream(filePath);

  return new Promise((resolve, reject) => {
    https.get(fileUrl, (response) => {
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve(filePath);
      });
      file.on("error", (err) => {
        reject(err);
      });
    });
  });
};

module.exports = downloadFile;
