const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");
const { delayExecution } = require("./utils/delayExecution");
const { downloadFile } = require("./utils/downloadFile");
const { exec } = require("child_process");
const MovieDB = require("node-themoviedb");
require("dotenv").config();

const mdb = new MovieDB(process.env.THE_MOVIE_DB_API_KEY);

const grabActorImage = async (actor, character, i) => {
  // Kill all leftover Puppeteer processes
  exec("pkill -9 -f puppeteer");

  return new Promise(async (resolve, reject) => {
    await delayExecution(i * 10000);

    const args = {
      query: {
        query: actor,
        include_adult: true,
      },
    };

    const response = await mdb.search
      .people(args)
      .then((res) => res.data)
      .then((data) => data.results[0])
      .catch((e) => console.error(e));

    if (response && response.profile_path) {
      const imageURL =
        "https://www.themoviedb.org/t/p/w600_and_h900_bestv2" +
        response.profile_path;

      if (imageURL) {
        return await downloadFile(
          imageURL,
          "actor_images",
          actor.replace(/\s/g, "_")
        )
          .then(() => {
            fs.writeFile(
              "remake_data.txt",
              `{"original_actor":"${actor}",${
                response.gender
                  ? `"original_actor_gender":"${
                      response.gender === 1 ? "female" : "male"
                    }",`
                  : ""
              }"original_image":"${`${actor.replace(
                /\s/g,
                "_"
              )}.jpg`}","character":"${character}"},`,
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
    } else {
      console.log(`No TMDB page found for actor ${actor}!`);
      reject();
    }
  });
};

module.exports = { grabActorImage };
