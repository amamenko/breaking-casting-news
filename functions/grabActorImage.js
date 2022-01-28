const axios = require("axios");
const cheerio = require("cheerio");
const { delayExecution } = require("./utils/delayExecution");
const { downloadFile } = require("./utils/downloadFile");

const grabActorImage = async (actor, i) => {
  const formattedActor = actor.toLowerCase().replace(" ", "+");
  const url = `https://www.google.com/search?q=${formattedActor}&tbm=isch&oq=${formattedActor}&sclient=img`;

  return new Promise(async (resolve, reject) => {
    await delayExecution(i * 10000);

    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    let results = [];
    $("img").each((i, image) => {
      results.push($(image).attr("src"));
    });
    results = results.filter((item) => !item.includes("logo"));
    const usedImageURL = results[0];

    return await downloadFile(usedImageURL, "actor_images", i)
      .then(() => resolve())
      .catch((e) => reject());
  });
};

module.exports = { grabActorImage };
