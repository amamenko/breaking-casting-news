const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");
const { delayExecution } = require("./utils/delayExecution");
const { downloadFile } = require("./utils/downloadFile");

const grabActorImage = async (actor, character, i) => {
  const formattedActor = actor.toLowerCase().replace(" ", "+");
  const url = `https://www.google.com/search?q=${formattedActor}+themoviedb&tbm=isch&oq=${formattedActor}+themoviedb&sclient=img`;

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

    if (usedImageURL) {
      return await downloadFile(
        usedImageURL,
        "actor_images",
        actor.replace(/\s/g, "_")
      )
        .then(() => {
          fs.writeFile(
            "remake_data.txt",
            `{"original_actor":"${actor}","character":"${character}"},`,
            { flag: "a" },
            (err) => {
              if (err) {
                console.error(err);
                reject();
              } else {
                resolve();
              }
            }
          );
        })
        .catch((e) => reject());
    } else {
      console.log(`No image found for actor ${actor}!`);
      reject();
    }
  });
};

module.exports = { grabActorImage };
