const wget = require("wget-improved");

const downloadImage = async (link, filePath) => {
  const download = wget.download(link, filePath);

  download.on("error", (err) => {
    console.error(err);
  });

  download.on("end", async () => {
    console.log("Done downloading image!");
  });
};

module.exports = { downloadImage };
