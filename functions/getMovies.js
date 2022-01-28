const moviesNames = require("movies-names");
const sample = require("lodash.sample");

const getMovies = () => {
  let allMovies = moviesNames.all;
  allMovies = allMovies.filter(
    (movie) =>
      movie.year >= 1960 &&
      movie.cast.length >= 4 &&
      !movie.genres.includes("Documentary")
  );

  const foundMovie = sample(allMovies);

  return foundMovie;
};

module.exports = { getMovies };
