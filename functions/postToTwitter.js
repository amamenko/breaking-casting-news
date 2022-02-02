const sample = require("lodash.sample");
const { TwitterApi } = require("twitter-api-v2");
const fs = require("fs");

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

  if (apologyArr.length === doppelgangersArr.length) {
    // All doppelgangers are, in fact, no longer alive to play their parts
    apologyArr.push("Oh geez, they're all dead.");
  }

  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_KEY_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  });

  if (client) {
    const doppelgangerFilesArr = [];

    fs.readdirSync("doppelganger_images").forEach((file) => {
      doppelgangerFilesArr.push("../doppelganger_images/" + file);
    });

    if (doppelgangerFilesArr.length > 0) {
      const promiseArr = [];

      for (const file of doppelgangerFilesArr) {
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
        .then(() => {
          console.log("Successfully posted breaking casting news to Twitter!");
        });
    }
  } else {
    console.log("No doppelganger images found! Can't make post!");
    return;
  }
};

module.exports = { postToTwitter };
