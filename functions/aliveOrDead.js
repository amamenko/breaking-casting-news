const wiki = require("wikijs").default;
const { format } = require("date-fns");

const aliveOrDead = async (name) => {
  return await wiki()
    .page(name)
    .then((page) => page.info())
    .then((data) => {
      if (data) {
        let causeOfDeath = data.deathCause
          ? typeof data.deathCause === "string"
            ? data.deathCause.toLowerCase()
            : data.deathCause
                .map((item) => item.toLowerCase())
                .filter((item) => item !== "labeldata")
                .join(" and ")
          : "";

        const firstWord = causeOfDeath
          ? causeOfDeath.split(" ")[0].toLowerCase()
          : "";

        if (firstWord === "murder") {
          causeOfDeath = "murder";
        } else if (firstWord === "assassination") {
          causeOfDeath = "assassination";
        } else if (firstWord === "suicide") {
          causeOfDeath = "suicide";
        } else if (firstWord === "death" || firstWord.includes("death")) {
          causeOfDeath = "";
        }

        return {
          deathDate: data.deathDate ? format(data.deathDate.date, "yyyy") : "",
          deathAge: data.deathDate ? data.deathDate.age : "",
          deathCause: causeOfDeath,
        };
      }
    })
    .catch(async (e) => {
      console.log(
        `Can't determine if ${name} is alive or dead from Wikipedia entry`
      );
      console.log(e);
      return;
    });
};

module.exports = { aliveOrDead };
