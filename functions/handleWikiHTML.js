const handleWikiHTML = (html) => {
  let castSection = html.split('id="Cast"');
  let sectionAfter = castSection[1];

  if (!sectionAfter) {
    castSection = html.split('id="Voice_cast"');
    sectionAfter = castSection[1];
  }

  if (sectionAfter) {
    let listSection = sectionAfter.split(/<ul>/gim)[1];

    const sectionSplit = listSection.split(/<li>/).filter((item) => item);

    if (sectionSplit.length === 1) {
      listSection =
        listSection + sectionAfter.split(/<ul>/gim)[2].replace("</ul>", "");
    }

    if (listSection) {
      const closeList = listSection.split("</ul>")[0];
      const eachBullet = closeList.split("\n");
      let castList = eachBullet.map((item) => {
        const formattedItem = item
          .replace("<li>", "")
          .replace("</li>", "")
          .replace(/<a href[\s\S]*?>/gim, "")
          .replace("</a>", "");

        return formattedItem;
      });

      castList = castList.map((item, i, arr) => {
        const lastIsAs = item.trim().slice(item.trim().length - 3) === "as:";

        if (lastIsAs) {
          return item.replace(":", " ") + arr[i + 1].replace(":", " ");
        } else {
          return item;
        }
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
                  .replace(/ *\([^)]*\)*/gim, "")
                  .replace(`".`, "")
                  .replace(/\s{2,}/g, " ")
                  .replace(/\.$/g, "");

                if (testCharName) {
                  testCharName = testCharName.split(" - ")[0];

                  if (testCharName) {
                    return testCharName.replace(/"/gim, "'").trim();
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
        if (characterArr.length >= 2) {
          return characterArr;
        } else {
          return "";
        }
      }
    }
  }
};

module.exports = { handleWikiHTML };
