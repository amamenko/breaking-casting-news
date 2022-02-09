const fs = require("fs");
const csv = require("csv-parser");
const { getDoppelganger } = require("./getDoppelganger");
const { grabActorImage } = require("./grabActorImage");
const { delayExecution } = require("./utils/delayExecution");
const { checkExistsAndDelete } = require("./utils/checkExistsAndDelete");
const { postToTwitter } = require("./postToTwitter");
const { getTMDBMovie } = require("./getTMDBMovie");

const createPost = async () => {
  // Make sure no trailing files or directories exist
  await checkExistsAndDelete("remake_data.txt");
  await checkExistsAndDelete("actor_images");
  await checkExistsAndDelete("doppelganger_images");
  await checkExistsAndDelete("remake_images");

  const foundMovie = await getTMDBMovie();

  const allPromises = [];

  if (foundMovie) {
    let actorsCharNames = foundMovie.cast;
    if (actorsCharNames) {
      for (let i = 0; i < actorsCharNames.length; i++) {
        const currentPromise = grabActorImage(
          actorsCharNames[i].actor,
          actorsCharNames[i].character,
          actorsCharNames[i].gender,
          actorsCharNames[i].image,
          i
        );
        allPromises.push(currentPromise);
      }

      console.log({
        foundMovie,
        actorsCharNames,
      });

      Promise.all(allPromises.map((p) => p.catch((error) => null))).then(
        async () => {
          console.log("All original actor image promises have been resolved!");

          // Delay necessary to make sure that all images are in actor_images directory
          await delayExecution(15000);

          try {
            let remakeData = fs.readFileSync("remake_data.txt", "utf8");
            remakeData = "[" + remakeData.toString() + "]";
            const lastCommaIndex = remakeData.lastIndexOf(",");
            const remakeDataArr = remakeData.split("");
            remakeDataArr.splice(lastCommaIndex, 1);
            remakeData = remakeDataArr.join("");

            const remakeJSON = JSON.parse(remakeData);

            const filesArr = [];

            fs.readdirSync("actor_images").forEach((file) => {
              filesArr.push(file);
            });

            const filePromises = [];

            for (let i = 0; i < filesArr.length; i++) {
              const nameOfActor = filesArr[i]
                .replace(".jpg", "")
                .replace(/_/g, " ");

              const currentPromise = getDoppelganger(
                remakeJSON,
                `actor_images/${filesArr[i]}`,
                nameOfActor,
                i
              );

              filePromises.push(currentPromise);
            }

            Promise.all(filePromises.map((p) => p.catch((error) => null))).then(
              async () => {
                console.log(
                  "All doppelganger actor image promises have been resolved!"
                );

                // Delay necessary to make sure that all images are in doppelganger_images directory
                await delayExecution(15000);

                const foundDoppelgangers = remakeJSON.filter(
                  (item) => item.new_actor
                );

                if (foundDoppelgangers.length >= 2) {
                  // TODO: Write posting function
                  console.log(
                    "🎥 Found enough doppelgangers to create post! 🎬"
                  );

                  await checkExistsAndDelete("remake_data.txt");

                  const movieStudiosArr = [];

                  fs.createReadStream("studios.csv")
                    .pipe(csv())
                    .on("data", (data) => movieStudiosArr.push(data))
                    .on("end", () => {
                      postToTwitter(
                        foundMovie,
                        foundDoppelgangers,
                        movieStudiosArr
                      );
                    });
                } else {
                  console.log(
                    "Not enough doppelgangers found! Can't make post."
                  );
                  await checkExistsAndDelete("remake_data.txt");
                  await checkExistsAndDelete("actor_images");
                  await checkExistsAndDelete("doppelganger_images");
                  return;
                }
              }
            );
          } catch (e) {
            console.log("Error:", e.stack);
          }
        }
      );
    } else {
      console.log(
        `Oops! No actors/characters were found for the movie "${foundMovie.title}" (${foundMovie.year}).`
      );
      return;
    }
  } else {
    console.log("Oops! No movie was found with that title.");
    return;
  }
};

module.exports = { createPost };
