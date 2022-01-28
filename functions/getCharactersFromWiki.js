const wiki = require("wikijs").default;
const { handleWikiHTML } = require("./handleWikiHTML");

const getCharactersFromWiki = async (foundMovie) => {
  if (foundMovie) {
    return await wiki()
      .page(`${foundMovie.title} (${foundMovie.year} film)`)
      .then(async (page) => await page.html())
      .then((html) => handleWikiHTML(html))
      .catch(async (e) => {
        if (e.message === "No article found") {
          return await wiki()
            .page(`${foundMovie.title} (film)`)
            .then(async (page) => await page.html())
            .then((html) => handleWikiHTML(html))
            .catch(async (e) => {
              if (e.message === "No article found") {
                return await wiki()
                  .page(`${foundMovie.title}`)
                  .then(async (page) => await page.html())
                  .then((html) => handleWikiHTML(html))
                  .catch((e) => {
                    console.error(e);
                    return;
                  });
              } else {
                console.error(e);
                return;
              }
            });
        } else {
          console.error(e);
          return;
        }
      });
  } else {
    console.log(
      "No found movies were supplied to the get characters from wiki function!"
    );
  }
};

module.exports = { getCharactersFromWiki };
