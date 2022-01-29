const handleWikiHTML = (html) => {
  const castSection = html.split('id="Cast"');
  const sectionAfter = castSection[1];

  if (sectionAfter) {
    const listSection = sectionAfter.split("<ul>")[1];

    if (listSection) {
      const closeList = listSection.split("</ul>")[0];
      const eachBullet = closeList.split("\n");
      const castList = eachBullet.map((item) => {
        const formattedItem = item
          .replace("<li>", "")
          .replace("</li>", "")
          .replace(/<a href[\s\S]*?>/gim, "")
          .replace("</a>", "");

        return formattedItem;
      });

      const formatName = (name, type) => {
        let testCharName =
          type === "actor" ? name.split(" as ")[0] : name.split(" as ")[1];

        if (testCharName) {
          testCharName = testCharName.split(":")[0]
            ? testCharName.split(":")[0].replace("</a>", "")
            : "";

          if (testCharName) {
            testCharName = testCharName.split(",")[0];
            if (testCharName) {
              testCharName = testCharName.split("<")[0];

              if (testCharName) {
                testCharName = testCharName
                  .replace(/\([^)]*\)|\[[^\]]*\]/gim, "")
                  .replace(`".`, "")
                  .replace(/\s{2,}/g, " ");

                if (testCharName) {
                  testCharName = testCharName.split(" - ")[0];

                  if (testCharName) {
                    return testCharName.trim();
                  }
                }
              }
            }
          }
        }

        return "";
      };

      let characterArr = castList.map((item) => {
        let actorName = formatName(item, "actor");
        let charName = formatName(item, "character");

        return {
          actor: actorName,
          character: charName,
        };
      });

      characterArr = characterArr.filter(
        (item) =>
          item.actor && item.character && item.character.split(" ").length <= 6
      );

      if (characterArr.length >= 4) {
        return characterArr.slice(0, 4);
      } else {
        return "";
      }
    }
  }
};

module.exports = { handleWikiHTML };
