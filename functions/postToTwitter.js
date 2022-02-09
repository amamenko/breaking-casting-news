const fs = require("fs");
const sample = require("lodash.sample");
const { TwitterApi } = require("twitter-api-v2");
const { checkExistsAndDelete } = require("./utils/checkExistsAndDelete");
const { generateRemakeImage } = require("./generateRemakeImage");

const postToTwitter = async (
  foundMovie,
  foundDoppelgangers,
  movieStudiosArr
) => {
  const movieTitle = foundMovie.title;
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

  let tweet = "";

  const tweetBase = `#BreakingNews ${
    randomMovieStudio.name
  } has announced a ${randomYear} remake of the ${
    movieGenre.length === 0 ? "" : movieGenre.join("/")
  } film "${movieTitle}" (${movieYear}) starring `;

  tweet = tweetBase + asArr.join(" ") + "\n\n#movies #film";

  if (tweet.length > 280) {
    doppelgangersArr.pop();

    if (doppelgangersArr.length < 2) {
      console.log(
        "Tweet too long! Tried to shorten doppelgangers but not enough doppelgangers found! Can't make post."
      );
      return;
    } else {
      const newAsArr = makeSentenceArrFromArr(doppelgangersArr);
      tweet = tweetBase + newAsArr.join(" ") + "\n\n#movies #film";
    }
  }

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
      }. We were unaware at the time we were casting the '${movieTitle}' remake that ${
        current.new_actor
      } had died${
        current.new_actor_death_year
          ? ` in ${current.new_actor_death_year}${
              current.new_actor_death_age
                ? ` at the age of ${current.new_actor_death_age}`
                : ""
            }${
              current.new_actor_death_cause
                ? ` due to ${current.new_actor_death_cause}`
                : ""
            }.`
          : "."
      }"`;
      apologyArr.push(apologyStatement);
    }
  }

  if (apologyArr.length === doppelgangersArr.length) {
    // All doppelgangers are, in fact, no longer alive to play their parts
    apologyArr.push(
      `Oh geez, they're ${apologyArr.length === 2 ? "both" : "all"} dead.`
    );
  }

  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_KEY_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  });

  if (client) {
    const doppelgangerFilesArr = [];

    for (const doppelganger of doppelgangersArr) {
      doppelgangerFilesArr.push(
        "./doppelganger_images/" + doppelganger.new_image
      );
    }

    if (doppelgangerFilesArr.length > 0) {
      const allImagePromises = [];

      for (let i = 0; i < doppelgangersArr.length; i++) {
        const current = doppelgangersArr[i];

        const currentPromise = generateRemakeImage(
          movieTitle,
          movieYear,
          current.character,
          current.original_actor,
          "./actor_images/" + current.original_image,
          current.new_actor,
          "./doppelganger_images/" + current.new_image,
          i
        );

        allImagePromises.push(currentPromise);
      }

      Promise.all(allImagePromises.map((p) => p.catch((error) => null))).then(
        async () => {
          console.log("All Twitter remake images have been created!");

          const filesArr = [];

          fs.readdirSync("remake_images").forEach((file) => {
            filesArr.push("./remake_images/" + file);
          });

          const promiseArr = [];

          for (const file of filesArr) {
            promiseArr.push(client.v1.uploadMedia(file));
          }

          // First, post all images to Twitter
          const mediaIds = await Promise.all(promiseArr);

          await client.v2
            .tweetThread([
              {
                text: tweet,
                media: { media_ids: mediaIds },
              },
              ...apologyArr,
            ])
            .then(async () => {
              console.log(
                "Successfully posted breaking casting news to Twitter!"
              );
              await checkExistsAndDelete("actor_images");
              await checkExistsAndDelete("doppelganger_images");
              await checkExistsAndDelete("remake_images");
            })
            .catch(async (e) => {
              console.error(
                "Something went wrong when trying to post Twitter thread!"
              );
              await checkExistsAndDelete("actor_images");
              await checkExistsAndDelete("doppelganger_images");
              await checkExistsAndDelete("remake_images");
            });
        }
      );
    }
  } else {
    console.log("No doppelganger images found! Can't make post!");
    await checkExistsAndDelete("actor_images");
    await checkExistsAndDelete("doppelganger_images");
    await checkExistsAndDelete("remake_images");

    return;
  }
};

module.exports = { postToTwitter };
