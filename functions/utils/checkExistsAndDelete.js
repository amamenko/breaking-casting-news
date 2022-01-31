const fs = require("fs");
const { checkFileExists } = require("./checkFileExists");
require("dotenv").config();

const checkExistsAndDelete = async (filename) => {
  const fileExists = await checkFileExists(filename);

  if (fileExists) {
    fs.rm(
      filename,
      {
        recursive: true,
        force: true,
      },
      () => {
        console.log(`${filename} file deleted!`);
      }
    );
  }
};

module.exports = { checkExistsAndDelete };
