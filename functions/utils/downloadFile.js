const fs = require("fs");
const axios = require("axios");
const { checkFileExists } = require("./checkFileExists");

const downloadFile = async (url, downloadFolder, index) => {
  const dirExists = await checkFileExists(downloadFolder);

  if (!dirExists) {
    fs.mkdirSync(downloadFolder);
  }

  const fileName = `actor_${index}.jpg`;

  try {
    const response = await axios({
      method: "GET",
      url,
      responseType: "stream",
    });

    response.data.pipe(fs.createWriteStream(`${downloadFolder}/${fileName}`));
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = { downloadFile };
