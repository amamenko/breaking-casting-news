const MovieDB = require("node-themoviedb");
const sample = require("lodash.sample");
require("dotenv").config();

const mdb = new MovieDB(process.env.THE_MOVIE_DB_API_KEY);

const getTMDBMovie = async () => {
  const allYears = [];
  for (let i = 1970; i <= new Date().getFullYear() - 2; i++) {
    allYears.push(i);
  }

  const randomYear = sample(allYears);

  let maximumPage = 1;

  if (randomYear >= 2020) {
    maximumPage = 20;
  } else if (randomYear >= 2010) {
    maximumPage = 10;
  } else if (randomYear >= 2000) {
    maximumPage = 6;
  } else if (randomYear >= 1995) {
    maximumPage = 4;
  } else if (randomYear >= 1990) {
    maximumPage = 3;
  } else if (randomYear >= 1985) {
    maximumPage = 2;
  } else {
    maximumPage = 1;
  }

  const args = {
    query: {
      include_adult: false,
      include_video: false,
      region: "US",
      year: randomYear,
      with_original_language: "en",
      // Exclude documentaries and TV movies
      without_genres: "99,10770",
      sort_by: "popularity.desc",
      page: maximumPage,
    },
  };

  const movieResults = await mdb.discover
    .movie(args)
    .then((res) => res.data)
    .then((data) => data.results)
    .catch((e) => console.error(e));

  if (movieResults && movieResults[0]) {
    const randomMovie = sample(movieResults);

    console.log(randomMovie);

    if (randomMovie) {
      let movieCast = await mdb.movie
        .getCredits({ pathParameters: { movie_id: randomMovie.id } })
        .then((res) => res.data)
        .then((data) => data.cast)
        .catch((e) => console.error(e));

      if (movieCast && movieCast[0]) {
        movieCast = movieCast.filter(
          (item) => item.known_for_department === "Acting"
        );
        const top4Actors = movieCast.slice(0, 4).map((item) => {
          return {
            name: item.name,
            character: item.character,
            gender: item.gender === 1 ? "female" : "male",
            image:
              "https://www.themoviedb.org/t/p/w600_and_h900_bestv2" +
              item.profile_path,
          };
        });
        console.log(top4Actors);
      }
    } else {
      console.log("No movie found!");
      return;
    }
  } else {
    console.log("No movie found!");
    return;
  }
};

module.exports = { getTMDBMovie };
