const fs = require("fs");
const { delayExecution } = require("./utils/delayExecution");
const { downloadFile } = require("./utils/downloadFile");
require("dotenv").config();

const grabActorImage = async (actor, character, gender, image, i) => {
  return new Promise(async (resolve, reject) => {
    await delayExecution(i * 10000);

    if (image) {
      return await downloadFile(
        image,
        "actor_images",
        actor.replace(/\s/g, "_")
      )
        .then(() => {
          fs.writeFile(
            "remake_data.txt",
            `{"original_actor":"${actor}",${
              gender ? `"original_actor_gender":"${gender}",` : ""
            }"original_image":"${`${actor.replace(
              /\s/g,
              "_"
            )}.jpg`}","character":"${character}"},`,
            { flag: "a" },
            (err) => {
              if (err) {
                console.error(err);
                reject();
              } else {
                resolve();
              }
            }
          );
        })
        .catch((e) => reject());
    } else {
      console.log(`No image found for actor ${actor}!`);
      reject();
    }
  });
};

module.exports = { grabActorImage };
