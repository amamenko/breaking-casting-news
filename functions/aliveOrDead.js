const wiki = require("wikijs").default;
const { format, parse, parseISO, intervalToDuration } = require("date-fns");

const aliveOrDead = async (name) => {
  const handleDoubleCheck = async () => {
    return await wiki()
      .page(name)
      .then(async (page) => {
        let summary = await page.summary();
        const firstOpenParanthesisIndex = summary.indexOf("(");
        const firstClosedParanethesisIndex = summary.indexOf(")");
        summary = summary.slice(
          firstOpenParanthesisIndex + 1,
          firstClosedParanethesisIndex
        );

        const dateRegex = /\w{3,9}?\s\d{1,2}?,\s\d{4}?/gim;
        const foundDates = summary.match(dateRegex);

        if (foundDates && foundDates.length === 2) {
          const monthDateYear = (str, form) => {
            return format(parse(str, "MMMM d, yyyy", new Date()), form);
          };

          const dateOfBirth = monthDateYear(foundDates[0], "yyyy-MM-dd");
          const dateOfDeath = monthDateYear(foundDates[1], "yyyy-MM-dd");
          const yearOfDeath = monthDateYear(foundDates[1], "yyyy");
          const lifeDuration = intervalToDuration({
            start: parseISO(dateOfBirth),
            end: parseISO(dateOfDeath),
          });
          const ageAtDeath = lifeDuration.years;

          return {
            deathDate: yearOfDeath,
            deathAge: ageAtDeath,
            deathCause: "",
          };
        } else {
          return;
        }
      });
  };

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

        causeOfDeath = causeOfDeath
          .replace(/(\baids\b)/gim, "AIDS")
          .replace(/\d{4}/gim, "");

        let dateOfDeath = "";

        if (data.deathDate) {
          if (data.deathDate.date) {
            dateOfDeath = format(data.deathDate.date, "yyyy");
          } else {
            dateOfDeath = format(data.deathDate, "yyyy");
          }
        }

        return {
          deathDate: dateOfDeath,
          deathAge: data.deathDate ? data.deathDate.age : "",
          deathCause: causeOfDeath.trim(),
        };
      }
    })
    .then(async (deathObj) => {
      if (deathObj.deathDate) {
        return deathObj;
      } else {
        return await handleDoubleCheck();
      }
    })
    .catch(async (err) => {
      return await handleDoubleCheck().catch(async (e) => {
        console.log(
          `Can't determine if ${name} is alive or dead from Wikipedia entry`
        );
        console.log(e);
        return;
      });
    });
};

module.exports = { aliveOrDead };
