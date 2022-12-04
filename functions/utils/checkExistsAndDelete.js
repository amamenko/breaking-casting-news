const fs = require("fs");
const { checkFileExists } = require("./checkFileExists");
require("dotenv").config();

const checkExistsAndDelete = async (filename) => {
  const fileExists = await checkFileExists(filename);

  if (fileExists) {
    fs.lstat(filename, (err, stats) => {
      if (err) console.error(err);
      if (stats.isFile()) {
        fs.unlink(filename, () => {
          console.log(`${filename} file deleted!`);
        });
      } else {
        if (stats.isDirectory()) {
          fs.rmdir(filename, () => {
            console.log(`${filename} directory deleted!`);
          });
        }
      }
    });
  }
};

module.exports = { checkExistsAndDelete };
