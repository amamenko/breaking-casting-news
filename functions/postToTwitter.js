const sample = require("lodash.sample");

const postToTwitter = async (
  foundMovie,
  foundDoppelgangers,
  movieStudiosArr
) => {
  const movieTite = foundMovie.title;
  const movieYear = foundMovie.year;
  const movieGenre = foundMovie.genres
    ? foundMovie.genres.slice(0, 2).map((genre) => genre.toLowerCase())
    : "";
  const randomMovieStudio = sample(movieStudiosArr);
  let doppelgangersArr = foundDoppelgangers.slice();

  const randomNumArr = [1, 2, 3];
  const currentYear = new Date().getFullYear();
  const randomYear = currentYear + sample(randomNumArr);

  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const makeSentenceArrFromArr = (arr) => {
    return arr.map((item, i, arr) => {
      if (i === arr.length - 1) {
        return `and ${capitalizeFirstLetter(
          item.new_actor
        )} as "${capitalizeFirstLetter(item.character)}."`;
      } else {
        return `${capitalizeFirstLetter(
          item.new_actor
        )} as "${capitalizeFirstLetter(item.character)}${
          arr.length > 2 ? "," : ""
        }"`;
      }
    });
  };

  const asArr = makeSentenceArrFromArr(doppelgangersArr);

  let tweet = `${
    randomMovieStudio.name
  } has announced a ${randomYear} remake of the ${
    movieGenre.length === 0 ? "" : movieGenre.join("/")
  } film "${movieTite}" (${movieYear}) starring `;

  tweet = tweet + asArr.join(" ");

  if (tweet.length > 280) {
    doppelgangersArr.pop();

    if (doppelgangersArr.length < 2) {
      console.log(
        "Tweet too long! Tried to shorten doppelgangers but not enough doppelgangers found! Can't make post."
      );
      return;
    } else {
      const newAsArr = makeSentenceArrFromArr(doppelgangersArr);
      tweet = tweet + newAsArr.join(" ");
    }
  }

  console.log({ tweet, tweetLength: tweet.length });
  console.log({ doppelgangersArr });

  const apologyArr = [];

  for (let i = 0; i < doppelgangersArr.length; i++) {
    const current = doppelgangersArr[i];
    if (current.new_actor_dead) {
      const updateTerms =
        apologyArr.length === 0
          ? "IMPORTANT UPDATE"
          : apologyArr.length === 1
          ? "IMPORTANT ADDITIONAL UPDATE"
          : apologyArr.length === 2
          ? "ANOTHER IMPORTANT ADDITIONAL UPDATE"
          : "YET ANOTHER IMPORTANT ADDITIONAL UPDATE";

      const apologyStatement = `${updateTerms}: ${
        randomMovieStudio.name
      } has released a statement: “We apologize to the family of ${
        current.new_actor
      }. We were unaware at the time we were casting the '${movieTite}' remake that ${
        current.new_actor
      } had died${
        current.new_actor_death_year
          ? ` in ${current.new_actor_death_year}.`
          : "."
      }"`;
      apologyArr.push(apologyStatement);
    }
  }

  console.log({ apologyArr });
};

module.exports = { postToTwitter };
