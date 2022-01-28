const { getCharactersFromWiki } = require("./getCharactersFromWiki");
const { getMovies } = require("./getMovies");
const { grabActorImage } = require("./grabActorImage");

const createPost = async () => {
  const foundMovies = getMovies();
  const actorsCharNames = await getCharactersFromWiki(foundMovies);

  const allPromises = [];

  if (actorsCharNames) {
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
        console.log("All image promises have been resolved!");
      }
    );
  }
};

module.exports = { createPost };
