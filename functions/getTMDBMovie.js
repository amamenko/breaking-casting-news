const MovieDB = require("node-themoviedb");
const sample = require("lodash.sample");
const { tmdbGenres } = require("./arrays/tmdbGenres");
const { format, parseISO } = require("date-fns");
require("dotenv").config();

const mdb = new MovieDB(process.env.THE_MOVIE_DB_API_KEY);

const getTMDBMovie = async () => {
  const allYears = [];
  for (let i = 1945; i <= new Date().getFullYear() - 2; i++) {
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

  const pageArr = [];

  for (let i = 1; i <= maximumPage; i++) {
    pageArr.push(i);
  }

  const randomPage = sample(pageArr);

  const args = {
    query: {
      include_adult: false,
      include_video: false,
      release_date: {
        gte: `${randomYear}-01-01`,
        lte: `${randomYear}-12-31`,
      },
      year: randomYear,
      with_original_language: "en",
      // Exclude documentaries and TV movies
      without_genres: "99,10770",
      sort_by: "popularity.desc",
      page: randomPage,
    },
  };

  const movieResults = await mdb.discover
    .movie(args)
    .then((res) => res.data)
    .then((data) => data.results)
    .catch((e) => console.error(e));

  if (movieResults && movieResults[0]) {
    const randomMovie = sample(movieResults);

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

        const top4Actors = movieCast
          .filter((item) => item.profile_path)
          .slice(0, 4)
          .map((item) => {
            return {
              actor: item.name.replace(/"/gim, "'"),
              character: item.character.replace(/"/gim, "'"),
              gender: item.gender === 1 ? "female" : "male",
              image:
                "https://www.themoviedb.org/t/p/w600_and_h900_bestv2" +
                item.profile_path,
            };
          });

        const formattedReleaseDate = format(
          parseISO(randomMovie.release_date),
          "yyyy"
        );

        return {
          title: randomMovie.title
            ? randomMovie.title
            : randomMovie.original_title,
          year: Math.min(randomYear, Number(formattedReleaseDate)).toString(),
          genres:
            randomMovie.genre_ids && randomMovie.genre_ids[0]
              ? randomMovie.genre_ids.map((item) => {
                  const foundEl = tmdbGenres.find((el) => el.id === item);

                  if (foundEl) {
                    return foundEl.name;
                  } else {
                    return "";
                  }
                })
              : "",
          cast: top4Actors,
        };
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
