const fs = require("fs");
const { getCharactersFromWiki } = require("./getCharactersFromWiki");
const { getDoppelganger } = require("./getDoppelganger");
const { getMovies } = require("./getMovies");
const { grabActorImage } = require("./grabActorImage");
const { delayExecution } = require("./utils/delayExecution");

const createPost = async () => {
  const foundMovies = getMovies();
  let actorsCharNames = await getCharactersFromWiki(foundMovies);

  const allPromises = [];

  if (actorsCharNames) {
    actorsCharNames = actorsCharNames
      .filter((item) => foundMovies.cast.includes(item.actor))
      .slice(0, 6);
    for (let i = 0; i < actorsCharNames.length; i++) {
      const currentPromise = grabActorImage(actorsCharNames[i].actor, i);
      allPromises.push(currentPromise);
    }

    console.log({
      foundMovies,
      actorsCharNames,
    });

    Promise.all(allPromises.map((p) => p.catch((error) => null))).then(
      async () => {
        console.log("All original actor image promises have been resolved!");

        // Delay necessary to make sure that all images are in actor_images directory
        await delayExecution(15000);

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
          }
        );
      }
    );
  }
};

module.exports = { createPost };
