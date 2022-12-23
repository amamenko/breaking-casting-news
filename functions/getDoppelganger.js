const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const axios = require("axios");
const { aliveOrDead } = require("./aliveOrDead");
const sample = require("lodash.sample");
const { downloadFile } = require("./utils/downloadFile");
const { delayExecution } = require("./utils/delayExecution");
const { removeLowercase } = require("./utils/removeLowercase");
const { exec } = require("child_process");
const { backupGetDoppelganger } = require("./backupGetDoppelganger");
const { executablePath } = require("puppeteer");
require("dotenv").config();

puppeteer.use(StealthPlugin());

const getDoppelganger = async (remakeJSON, fileName, fullName, i) => {
  return new Promise(async (resolve, reject) => {
    // Kill all leftover Puppeteer processes
    exec("pkill -9 -f puppeteer");

    await delayExecution(i * 120000);

    const foundEntry = remakeJSON.find(
      (item) => item.original_actor === fullName
    );

    if (foundEntry) {
      const handleDoppelgangerData = async (randomDoppelganger) => {
        if (randomDoppelganger) {
          return await downloadFile(
            randomDoppelganger.image,
            "doppelganger_images",
            randomDoppelganger.name.replace(/\s/g, "_")
          )
            .then(async () => {
              foundEntry.new_actor = randomDoppelganger.name;
              foundEntry.new_image = `${randomDoppelganger.name.replace(
                /\s/g,
                "_"
              )}.jpg`;

              try {
                const deadOrAliveResult = await aliveOrDead(
                  randomDoppelganger.name
                );

                if (deadOrAliveResult) {
                  if (deadOrAliveResult.deathDate) {
                    const deathYear = deadOrAliveResult.deathDate
                      ? deadOrAliveResult.deathDate.replace(/\D/g, "")
                      : "";

                    // Not to go too far back in time
                    if (Number(deathYear) >= 1920) {
                      foundEntry.new_actor_dead = true;
                      foundEntry.new_actor_death_year = deathYear;
                    }
                  } else {
                    foundEntry.new_actor_dead = false;
                  }

                  if (deadOrAliveResult.deathAge) {
                    foundEntry.new_actor_death_age = deadOrAliveResult.deathAge;
                  } else {
                    foundEntry.new_actor_death_age = "";
                  }

                  if (deadOrAliveResult.deathCause) {
                    foundEntry.new_actor_death_cause =
                      deadOrAliveResult.deathCause;
                  } else {
                    foundEntry.new_actor_death_cause = "";
                  }
                } else {
                  foundEntry.new_actor_dead = false;
                }

                resolve();
              } catch (e) {
                console.error(e);
                foundEntry.new_actor_dead = false;
                reject();
              }

              resolve();
            })
            .catch((e) => {
              console.error(e);
              reject();
            });
        } else {
          console.log(`No doppelganger found for actor ${fullName}.`);
          reject();
        }
      };

      console.log("Launching Puppeteer process now...");
      const browser = await puppeteer.launch({
        args: [
          "--disable-setuid-sandbox",
          "--single-process",
          "--no-sandbox",
          "--no-zygote",
        ],
        executablePath:
          process.env.NODE_ENV === "production"
            ? process.env.PUPPETEER_EXECUTABLE_PATH
            : executablePath(),
      });

      try {
        const page = await browser.newPage();
        console.log("Successfully launched new Puppeteer page!");
        await page.setDefaultNavigationTimeout(0);
        page.on("error", (err) => {
          reject();
        });
        console.log("Visiting URL now...");
        await page.goto("https://starbyface.com", {
          timeout: 0,
        });

        await page.waitForTimeout(5000);
        console.log("Successfully visited URL!");
        try {
          await page.click("button[mode=secondary]");
        } catch (e) {
          console.error("No secondary mode button found!");
        }

        await page.waitForTimeout(5000);

        try {
          await page.click("button[mode=primary]");
        } catch (e) {
          console.error("No primary mode button found!");
        }

        const uploadEl = await page.$("input[type=file]");
        await uploadEl.uploadFile(fileName);

        await page.waitForTimeout(30000);

        const maleList = await page.$$("div[id=candidates] > div[name]");
        const femaleList = await page.$$(
          "div[id=candidatesFemale] > div[name]"
        );

        const getNameAndImage = async (list) => {
          const fullListArr = [];

          for (const target of list) {
            const innerHTML = await page.evaluate((el) => el.innerHTML, target);
            let name = await page.evaluate(
              (el) => el.getAttribute("name"),
              target
            );

            let splitInnerHTML = innerHTML.split("\n");
            splitInnerHTML = splitInnerHTML.filter((item) =>
              item.includes("<img ")
            );

            const imgTag = splitInnerHTML[0];

            if (imgTag) {
              let imgSplit = imgTag.split(/src="(.*?)"/gim);
              imgSplit = imgSplit.filter((item) => item.includes(".com"));

              name = removeLowercase(name);

              if (imgSplit[0]) {
                fullListArr.push({
                  name,
                  image: imgSplit[0],
                });
              }
            }
          }

          return fullListArr;
        };

        const matchedMales = await getNameAndImage(maleList);
        const matchedFemales = await getNameAndImage(femaleList);

        const originalActorGender = foundEntry.original_actor_gender;
        const firstName = fullName.split(" ")[0];

        let genderOfFirstName = "";

        if (originalActorGender) {
          genderOfFirstName = originalActorGender;
        } else {
          genderOfFirstName = await axios(
            `https://api.genderize.io/?name=${firstName}`
          )
            .then((res) => res.data)
            .then((data) => data.gender);
        }

        let chosenArr = [];

        if (genderOfFirstName === "male") {
          if (matchedMales[0]) {
            chosenArr = matchedMales;
          } else {
            chosenArr = matchedFemales;
          }
        } else if (genderOfFirstName === "female") {
          if (matchedFemales[0]) {
            chosenArr = matchedFemales;
          } else {
            chosenArr = matchedMales;
          }
        } else {
          const genderArr = ["male", "female"];
          const randomGender = sample(genderArr);

          if (randomGender === "male") {
            if (matchedMales[0]) {
              chosenArr = matchedMales;
            } else {
              chosenArr = matchedFemales;
            }
          } else {
            if (matchedFemales[0]) {
              chosenArr = matchedFemales;
            } else {
              chosenArr = matchedMales;
            }
          }
        }

        let splitArr = fullName.split(" ");
        splitArr = splitArr.map((el) => el.toLowerCase());

        chosenArr = chosenArr.filter((item) => {
          let itemSplitArr = item.name.split(" ");
          itemSplitArr = itemSplitArr.map((el) => el.toLowerCase());

          if (item.name !== fullName) {
            if (itemSplitArr.some((el) => splitArr.includes(el))) {
              return false;
            } else {
              return true;
            }
          } else {
            return false;
          }
        });
        // Choose from top 3 closest matches
        chosenArr = chosenArr.slice(0, 3);
        const randomDoppelganger = sample(chosenArr);

        handleDoppelgangerData(randomDoppelganger);
      } catch (e) {
        console.log(
          `Received error from StarByFace for ${fullName}.\nTrying backup face recognition source!`
        );
        console.error(e);
        const backupDoppelganger = await backupGetDoppelganger(
          fileName,
          fullName
        );
        handleDoppelgangerData(backupDoppelganger);
      } finally {
        await browser.close();
      }
    } else {
      console.log(`No matching found entry was found!`);
      reject();
    }
  });
};

module.exports = { getDoppelganger };
